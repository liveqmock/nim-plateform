package com.poweruniverse.nim.plateform.servlet;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import com.poweruniverse.nim.base.bean.Environment;
import com.poweruniverse.nim.base.description.Application;

/**
 * 记录系统访问人数 以及在线人数
 * @author Administrator
 *
 */
public class SessionListener implements HttpSessionListener{
	
	public void sessionCreated(HttpSessionEvent arg0) {
		Application.onlineUserAdd();
	}

	public void sessionDestroyed(HttpSessionEvent arg0) {
		Application.onlineUserSubtract();
		Environment env = (Environment)arg0.getSession().getAttribute(Environment.ENV);
		if(env!=null){
			env.userLogout();
		}
	}

}
