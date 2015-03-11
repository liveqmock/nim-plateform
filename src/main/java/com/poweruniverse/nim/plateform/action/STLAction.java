package com.poweruniverse.nim.plateform.action;


import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.hibernate.Session;

import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.message.Result;
import com.poweruniverse.nim.data.entity.EntityManager;
import com.poweruniverse.nim.data.entity.system.ShiTiLei;
import com.poweruniverse.nim.data.entity.system.ZiDuan;
import com.poweruniverse.nim.data.entity.system.ZiDuanLX;
import com.poweruniverse.nim.data.entity.system.base.EntityI;
import com.poweruniverse.nim.data.service.utils.HibernateSessionFactory;


public class STLAction {
	
	public Result onEntityGenerate(String gongNengDH, String caoZuoDH,List<EntityI> entities,JSONObject submitData,Integer yongHuDM) throws Exception{
		int errorCount = 0;
		//
		Session sess = HibernateSessionFactory.getSession();
		JSONObject sessionConfigure1 = HibernateSessionFactory.getConfiguration();
		JSONArray xiTongConfigs = sessionConfigure1.getJSONArray("xiTongs");
		Map<String,JSONObject> xiTongMap = new HashMap<String,JSONObject>();
		for(int i=0;i<xiTongConfigs.size();i++){
			JSONObject xiTongConfig = xiTongConfigs.getJSONObject(i);
			xiTongMap.put(xiTongConfig.getString("name"), xiTongConfig);
		}
		//根据当前实体类数据 生成json文件 并自动生成java文件及hbm文件 提示用户刷新并重启
		for(int j=0;j<entities.size();j++){
			ShiTiLei entityObj = (ShiTiLei)entities.get(j);
			
			if(entityObj.getXiTong()==null){
				return new JSONMessageResult("实体类("+entityObj.getShiTiLeiMC()+")所属系统不能为空!");
			}else if(entityObj.getBiaoMing()==null){
				return new JSONMessageResult("实体类("+entityObj.getShiTiLeiMC()+")表名不能为空!");
			}else if(!entityObj.getBiaoMing().startsWith((entityObj.getXiTong().getXiTongDH()+"_").toUpperCase())){
				return new JSONMessageResult("实体类("+entityObj.getShiTiLeiMC()+")的表名("+entityObj.getBiaoMing()+")开头必须与系统代号("+(entityObj.getXiTong().getXiTongDH()+"_").toUpperCase()+")一致!");
			}
			
			JSONObject xiTongConfig = xiTongMap.get(entityObj.getXiTong().getXiTongDH());
			if(xiTongConfig == null){
				return new JSONMessageResult("在application.cfg.xml中的sessionFactory元素下，未找到系统("+entityObj.getXiTong().getXiTongDH()+")的定义!");
			}
			//将类名记录在stl对象中 
			if(entityObj.getShiTiLeiClassName()==null){
				String classPackageName = "";
				String className = "";
				
				//确定包名以及类名
				String[] classPackages =entityObj.getBiaoMing().toLowerCase().substring(0, entityObj.getBiaoMing().lastIndexOf('_')).split("_");
				if("sys".equals(classPackages[0])){
					classPackageName = ".system";
				}else{
					for(int i = 0;i<classPackages.length;i++){
						classPackageName+= "."+classPackages[i];
					}
				}
				className = entityObj.getBiaoMing().substring(entityObj.getBiaoMing().lastIndexOf('_') +1);
				
				//类名必须以大写字母开头
				String firstClassName= className.replaceFirst(className.substring(0, 1),className.substring(0, 1).toUpperCase());
				if(!firstClassName.equals(className)){
					return new JSONMessageResult("实体类("+entityObj.getShiTiLeiMC()+")表名("+entityObj.getBiaoMing()+")的最后一段("+className+")必须以大写字母开头!");
				}else{
					//检查字段代号
					for(ZiDuan zd:entityObj.getZds()){
						String ziDuanDH = zd.getZiDuanDH();
						
						String firstZiDuanDH= ziDuanDH.replaceFirst(ziDuanDH.substring(0, 1),ziDuanDH.substring(0, 1).toUpperCase());
						if(firstZiDuanDH.equals(ziDuanDH)){
							return new JSONMessageResult("实体类("+entityObj.getShiTiLeiMC()+")中字段("+zd.getZiDuanBT()+")的代号("+ziDuanDH+")必须以小写字母开头!");
						}
					}
				}
				//
				String fullClassName = xiTongConfig.getString("entityPackage")+".entity"+classPackageName+"."+className;
				
				entityObj.setShiTiLeiClassName(fullClassName);
			}
			
			//是否业务表
			if(entityObj.getShiFouYWB().booleanValue()){
				//业务表要保证有n个业务字段
				if(!entityObj.hasZiDuan("suoYouZhe")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("所有者");
					zd.setZiDuanDH("suoYouZhe");
					zd.setLieMing("suoYouZhe");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_OBJECT,"object"));
					zd.setZiDuanCD(12);
					ShiTiLei stl = (ShiTiLei)sess.load(ShiTiLei.class, 18);
					zd.setGuanLianSTL(stl);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}
				
				if(!entityObj.hasZiDuan("assignee")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("执行者");
					zd.setZiDuanDH("assignee");
					zd.setLieMing("assignee");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_OBJECT,"object"));
					zd.setZiDuanCD(12);
					ShiTiLei stl = (ShiTiLei)sess.load(ShiTiLei.class, 18);
					zd.setGuanLianSTL(stl);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}
				
				if(!entityObj.hasZiDuan("suoShuBM")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("所属部门");
					zd.setZiDuanDH("suoShuBM");
					zd.setLieMing("suoShuBM");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_OBJECT,"object"));
					zd.setZiDuanCD(12);
					ShiTiLei stl = (ShiTiLei)sess.load(ShiTiLei.class, 19);
					zd.setGuanLianSTL(stl);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}
				
				if(!entityObj.hasZiDuan("luRuRen")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("录入人");
					zd.setZiDuanDH("luRuRen");
					zd.setLieMing("luRuRen");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_STRING,"string"));
					zd.setZiDuanCD(200);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
					
				}
				if(!entityObj.hasZiDuan("luRuRQ")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("录入日期");
					zd.setZiDuanDH("luRuRQ");
					zd.setLieMing("luRuRQ");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_DATE,"date"));
					zd.setZiDuanCD(7);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}
				
				if(!entityObj.hasZiDuan("xiuGaiRen")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("修改人");
					zd.setZiDuanDH("xiuGaiRen");
					zd.setLieMing("xiuGaiRen");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_STRING,"string"));
					zd.setZiDuanCD(200);
					zd.setYunXuKZ(true);
					entityObj.addTozds(entityObj, zd);
				}
				
				if(!entityObj.hasZiDuan("xiuGaiRQ")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("修改日期");
					zd.setZiDuanDH("xiuGaiRQ");
					zd.setLieMing("xiuGaiRQ");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_DATE,"date"));
					zd.setZiDuanCD(7);
					zd.setYunXuKZ(true);
					entityObj.addTozds(entityObj, zd);
				}
				
				if(!entityObj.hasZiDuan("shenHeRen")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("审核人");
					zd.setZiDuanDH("shenHeRen");
					zd.setLieMing("shenHeRen");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_STRING,"string"));
					zd.setZiDuanCD(200);
					zd.setYunXuKZ(true);
					entityObj.addTozds(entityObj, zd);
				}
				if(!entityObj.hasZiDuan("shenHeRQ")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("审核日期");
					zd.setZiDuanDH("shenHeRQ");
					zd.setLieMing("shenHeRQ");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_DATE,"date"));
					zd.setZiDuanCD(7);
					zd.setYunXuKZ(true);
					entityObj.addTozds(entityObj, zd);
				}
				if(!entityObj.hasZiDuan("shenHeYJ")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("审核意见");
					zd.setZiDuanDH("shenHeYJ");
					zd.setLieMing("shenHeYJ");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_STRING,"string"));
					zd.setZiDuanCD(1200);
					zd.setYunXuKZ(true);
					entityObj.addTozds(entityObj, zd);
				}
				if(!entityObj.hasZiDuan("shenHeZT")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("审核状态");
					zd.setZiDuanDH("shenHeZT");
					zd.setLieMing("shenHeZT");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_INT,"int"));
					zd.setZiDuanCD(2);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}
				
				if(!entityObj.hasZiDuan("shanChuZT")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("删除状态");
					zd.setZiDuanDH("shanChuZT");
					zd.setLieMing("shanChuZT");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_BOOLEAN,"boolean"));
					zd.setZiDuanCD(2);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}
				
				if(!entityObj.hasZiDuan("processInstanceId")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("流程实例代码");
					zd.setZiDuanDH("processInstanceId");
					zd.setLieMing("processInstanceId");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_STRING,"string"));
					zd.setZiDuanCD(40);
					zd.setYunXuKZ(true);
					entityObj.addTozds(entityObj, zd);
				}

				if(!entityObj.hasZiDuan("processInstanceEnded")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("流程是否完成");
					zd.setZiDuanDH("processInstanceEnded");
					zd.setLieMing("processInstanceEnded");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_BOOLEAN,"boolean"));
					zd.setZiDuanCD(2);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}

				if(!entityObj.hasZiDuan("processInstanceTerminated")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("流程是否终止");
					zd.setZiDuanDH("processInstanceTerminated");
					zd.setLieMing("processInstanceTerminated");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_BOOLEAN,"boolean"));
					zd.setZiDuanCD(2);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}
				
				if(!entityObj.hasZiDuan("processInstanceStatus")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("流程执行状态");
					zd.setZiDuanDH("processInstanceStatus");
					zd.setLieMing("processInstanceStatus");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_STRING,"string"));
					zd.setZiDuanCD(200);
					zd.setYunXuKZ(true);
					entityObj.addTozds(entityObj, zd);
				}
				if(!entityObj.hasZiDuan("processInstanceSuspended")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("流程暂停状态");
					zd.setZiDuanDH("processInstanceSuspended");
					zd.setLieMing("processInstanceSuspended");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_BOOLEAN,"boolean"));
					zd.setZiDuanCD(2);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}
				if(!entityObj.hasZiDuan("processInstanceSuspendReason")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("流程暂停原因");
					zd.setZiDuanDH("processInstanceSuspendReason");
					zd.setLieMing("processInstanceSuspendReason");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_STRING,"string"));
					zd.setZiDuanCD(200);
					zd.setYunXuKZ(true);
					entityObj.addTozds(entityObj, zd);
				}
				
				//
				if(!entityObj.hasZiDuan("taskMessage")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("任务信息");
					zd.setZiDuanDH("taskMessage");
					zd.setLieMing("taskMessage");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_STRING,"string"));
					zd.setZiDuanCD(1200);
					zd.setYunXuKZ(true);
					entityObj.addTozds(entityObj, zd);
				}

				if(!entityObj.hasZiDuan("shiFouDXTZ")){
					ZiDuan zd = new ZiDuan();
					zd.setZiDuanBT("是否短信通知");
					zd.setZiDuanDH("shiFouDXTZ");
					zd.setLieMing("shiFouDXTZ");
					zd.setShiTiLei(entityObj);
					zd.setZiDuanLX(new ZiDuanLX(ZiDuanLX.ZiDuanLX_BOOLEAN,"boolean"));
					zd.setZiDuanCD(2);
					zd.setYunXuKZ(false);
					entityObj.addTozds(entityObj, zd);
				}
			}
			//以当前时间为版本号
			String versionString = EntityManager.createEntityDefine(entityObj,Calendar.getInstance().getTime(),xiTongConfig);
			if(versionString!=null){
				entityObj.setShiTiLeiBB(versionString);
				sess.update(entityObj);
			}else{
				errorCount++;
			}
		}
		JSONMessageResult ret = null;
		if(errorCount==0){
			ret = new JSONMessageResult();
		}else{
			ret = new JSONMessageResult("共"+entities.size()+"个实体类，其中"+errorCount+"个生成失败！");
		}
		return ret;
	}
	

}
