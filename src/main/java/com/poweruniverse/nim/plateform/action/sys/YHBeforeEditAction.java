package com.poweruniverse.nim.plateform.action.sys;


import java.util.Arrays;
import java.util.List;

import net.sf.json.JSONObject;

import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.data.action.BeforeAction;
import com.poweruniverse.nim.data.entity.sys.GongNengCZ;
import com.poweruniverse.nim.data.entity.sys.YongHu;
import com.poweruniverse.nim.data.entity.sys.base.EntityI;


public class YHBeforeEditAction extends BeforeAction {
	
	//新增或编辑用户时，检查登录名，不允许使用 system admin administrator,并将用户名改为大写
	public JSONMessageResult invoke(YongHu yongHu, GongNengCZ gongNengCZ, EntityI entity,JSONObject jsonObj) throws Exception {
		YongHu yh = (YongHu)entity;
		if(yh.getDengLuDH()==null || yh.getDengLuDH().length() < 3){
			throw new Exception("请提供长度不少于3位字符的登录代号!");
		}
		//
		String dengLuDH = yh.getDengLuDH().toUpperCase();
		
		List<String> restrics = Arrays.asList("SYS","ADMIN","SYSTEM","ADMINISTRATOR");
		if(restrics.contains(dengLuDH)){
			throw new Exception("不允许使用系统保留的登录代号!");
		}
		
		if(!yh.getDengLuDH().equals(dengLuDH)){
			yh.setDengLuDH(dengLuDH);
		}
		
		return new JSONMessageResult();
	}

}
