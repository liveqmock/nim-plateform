package com.poweruniverse.nim.plateform.action.sys;


import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.util.Calendar;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import net.sf.json.JSONObject;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.SAXReader;
import org.dom4j.io.XMLWriter;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

import com.poweruniverse.nim.base.description.Application;
import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.data.action.AfterAction;
import com.poweruniverse.nim.data.entity.EntityManager;
import com.poweruniverse.nim.data.entity.RegisterManager;
import com.poweruniverse.nim.data.entity.sys.GongNeng;
import com.poweruniverse.nim.data.entity.sys.GongNengCZ;
import com.poweruniverse.nim.data.entity.sys.ShiTiLei;
import com.poweruniverse.nim.data.entity.sys.YongHu;
import com.poweruniverse.nim.data.entity.sys.ZiDuan;
import com.poweruniverse.nim.data.entity.sys.base.EntityI;
import com.poweruniverse.nim.data.service.utils.HibernateSessionFactory;

/**
 * 删除了实体类 需要检查并清空关联的字段(功能的关联实体类、字段的关联实体类、字段的关联父类字段等)
 * @author Administrator
 *
 */
public class STLAfterDeleteAction extends AfterAction {
	
	public JSONMessageResult invoke(YongHu yongHu, GongNengCZ gongNengCZ, EntityI entity,JSONObject jsonObj) throws Exception {
		Session sess = HibernateSessionFactory.getSession();
		ShiTiLei deletedStl = (ShiTiLei)entity;
		//检查是否有功能需要处理
		Set<GongNeng> tobeGenerateGns = new HashSet<GongNeng>();
		
		@SuppressWarnings("unchecked")
		List<GongNeng> gns = (List<GongNeng>)sess.createCriteria(GongNeng.class).add(Restrictions.eq("shiTiLei.id", deletedStl.pkValue())).list();
		if(gns.size()>0){
			for(GongNeng gn:gns){
				gn.setShiTiLei(null);
				sess.update(gn);
				
				tobeGenerateGns.add(gn);
			}
		}
		//重新生成功能定义文件
		if(tobeGenerateGns.size()>0){
			for(GongNeng gn:tobeGenerateGns){
				String versionString = RegisterManager.createGongNengDefine(gn,Calendar.getInstance().getTime(),HibernateSessionFactory.getConfiguration(gn.getXiTong().getXiTongDH()));
				if(versionString!=null){
					gn.setGongNengBB(versionString);
					sess.update(gn);
				}
			}
		}
		
		
		//记录那些实体类受影响了
		Set<ShiTiLei> tobeGenerateStls = new HashSet<ShiTiLei>();
		//检查是否有字段需要处理
		@SuppressWarnings("unchecked")
		List<ZiDuan> zds = (List<ZiDuan>)sess.createCriteria(ZiDuan.class).add(Restrictions.eq("guanLianSTL.id", deletedStl.pkValue())).list();
		if(zds.size()>0){
			for(ZiDuan zd:zds){
				zd.setGuanLianSTL(null);
				sess.update(zd);
				
				tobeGenerateStls.add(zd.getShiTiLei());
			}
		}
		//检查是否有关联父类字段需要处理
		@SuppressWarnings("unchecked")
		List<ZiDuan> guanLianFLZDs = (List<ZiDuan>)sess.createCriteria(ZiDuan.class)
				.createAlias("guanLianFLZD", "zd_glflzd")
				.add(Restrictions.eq("zd_glflzd.shiTiLei.id", deletedStl.pkValue())).list();
		if(guanLianFLZDs.size()>0){
			for(ZiDuan zd:guanLianFLZDs){
				zd.setGuanLianFLZD(null);
				sess.update(zd);
				
				tobeGenerateStls.add(zd.getShiTiLei());
			}
		}
		//重新生成实体类定义文件
		if(tobeGenerateStls.size()>0){
			for(ShiTiLei stl:tobeGenerateStls){
				String versionString = EntityManager.createEntityDefine(stl,Calendar.getInstance().getTime(),HibernateSessionFactory.getConfiguration(stl.getXiTong().getXiTongDH()));
				if(versionString!=null){
					stl.setShiTiLeiBB(versionString);
					sess.update(stl);
				}
			}
		}
		
		//还需要删除对应的def.json文件 以及配置文件中的映射
		//将当前文件链接添加到hibernate.cfg.xml文件中
		synchronized(deletedStl.getXiTong()){
			
			String shiTiLeiClassName = deletedStl.getShiTiLeiClassName();
			String hbmFileName = shiTiLeiClassName.replace(".entity."+deletedStl.getXiTong().getXiTongDH(), ".hbm."+deletedStl.getXiTong().getXiTongDH());
			String jsonDefFileName = hbmFileName.replaceAll("\\.", "/")+".def.json";
			hbmFileName = hbmFileName.replaceAll("\\.", "/")+".hbm.xml";
			
			String mappingFileName = Application.getInstance().getContextPath()+ "WEB-INF/mapping."+deletedStl.getXiTong().getXiTongDH()+".xml";
			File mappingFile = new File(mappingFileName);
			if(mappingFile.exists()){
				SAXReader reader = new SAXReader();
				reader.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
				Document doc = reader.read(mappingFile);
				Element root = doc.getRootElement();
				
				//检查并删除mapping.XXX.xml中 是否有此实体类的关联
				@SuppressWarnings("unchecked")
				Iterator<Element> mappingEls = root.elements("mapping").iterator();
				Element mappingEl = null;
				while (mappingEls.hasNext()) {
					mappingEl = mappingEls.next();
					if (hbmFileName.equals(mappingEl.attributeValue("resource"))) {
						System.out.println("...............................删除:"+deletedStl+"的mapping信息");
						root.remove(mappingEl);
						
						XMLWriter output = new XMLWriter(new OutputStreamWriter(new FileOutputStream(mappingFile), "utf-8"),OutputFormat.createPrettyPrint());
						output.write(doc);
						output.close();
						
						System.out.println("...............................处理完成:"+deletedStl);
						break;
					}
				}
				
			}
		}
		return new JSONMessageResult();
	}

}
