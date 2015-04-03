package com.poweruniverse.nim.plateform.action.sys;


import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.hibernate.Session;

import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.data.action.OnAction;
import com.poweruniverse.nim.data.entity.EntityManager;
import com.poweruniverse.nim.data.entity.RegisterManager;
import com.poweruniverse.nim.data.entity.sys.GongNeng;
import com.poweruniverse.nim.data.entity.sys.GongNengCZ;
import com.poweruniverse.nim.data.entity.sys.YongHu;
import com.poweruniverse.nim.data.entity.sys.base.EntityI;
import com.poweruniverse.nim.data.service.utils.HibernateSessionFactory;

/**
 * 生成定义文件
 * @author Administrator
 *
 */
public class GNOnGenerateAction extends OnAction {
	
	public JSONMessageResult invoke(YongHu yongHu, GongNengCZ gongNengCZ, EntityI entity,JSONObject jsonObj) throws Exception {
		//
		Session sess = HibernateSessionFactory.getSession();
		JSONObject sessionConfigure1 = HibernateSessionFactory.getConfiguration();
		JSONArray xiTongConfigs = sessionConfigure1.getJSONArray("xiTongs");
		Map<String,JSONObject> xiTongMap = new HashMap<String,JSONObject>();
		for(int i=0;i<xiTongConfigs.size();i++){
			JSONObject xiTongConfig = xiTongConfigs.getJSONObject(i);
			xiTongMap.put(xiTongConfig.getString("name"), xiTongConfig);
		}
		//根据当前功能数据 生成json文件 并自动生成java文件及hbm文件 提示用户刷新并重启
		GongNeng entityObj = (GongNeng)entity;
		
		if(entityObj.getXiTong()==null){
			throw new Exception("功能("+entityObj.getGongNengMC()+")所属系统不能为空!");
		}else if(entityObj.getGongNengDH()==null){
			throw new Exception("功能("+entityObj.getGongNengMC()+")的功能代号不能为空!");
		}
		//借用数据源定义中的路径 
		JSONObject xiTongConfig = xiTongMap.get(entityObj.getXiTong().getXiTongDH());
		if(xiTongConfig == null){
			throw new Exception("在application.cfg.xml中的sessionFactory元素下，未找到系统("+entityObj.getXiTong().getXiTongDH()+")的定义!");
		}
		
		//以当前时间为版本号
		String versionString = RegisterManager.createGongNengDefine(entityObj,Calendar.getInstance().getTime(),xiTongConfig);
		if(versionString!=null){
			entityObj.setGongNengBB(versionString);
			sess.update(entityObj);
		}
	
		return new JSONMessageResult();
	}

}
