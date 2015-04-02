package com.poweruniverse.nim.plateform.action.sys;


import net.sf.json.JSONObject;

import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.data.action.OnAction;
import com.poweruniverse.nim.data.entity.sys.GongNengCZ;
import com.poweruniverse.nim.data.entity.sys.YongHu;
import com.poweruniverse.nim.data.entity.sys.base.EntityI;

/**
 * 生成定义文件
 * @author Administrator
 *
 */
public class GNOnGenerateAction extends OnAction {
	
	public JSONMessageResult invoke(YongHu yongHu, GongNengCZ gongNengCZ, EntityI entity,JSONObject jsonObj) throws Exception {
	
		return new JSONMessageResult();
	}

}
