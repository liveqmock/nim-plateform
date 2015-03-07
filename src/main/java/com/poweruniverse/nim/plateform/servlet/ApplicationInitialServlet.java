package com.poweruniverse.nim.plateform.servlet;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

import javax.servlet.ServletException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.hibernate.SessionFactory;

import com.poweruniverse.nim.base.description.Application;
import com.poweruniverse.nim.base.description.Component;
import com.poweruniverse.nim.base.description.LocalComponent;
import com.poweruniverse.nim.base.description.LocalWebservice;
import com.poweruniverse.nim.base.description.RemoteComponent;
import com.poweruniverse.nim.base.description.RemoteWebservice;
import com.poweruniverse.nim.base.servlet.BasePlateformServlet;
import com.poweruniverse.nim.data.entity.EntityManager;
import com.poweruniverse.nim.data.service.utils.HibernateSessionFactory;
import com.poweruniverse.nim.data.service.utils.JSONConvertUtils;

/**
 * 初始化整个应用
 * 1、读取配置文件
 * 2、启动各组件（生成clicent端代码）
 * 3、
 * @author Administrator
 *
 */
public class ApplicationInitialServlet extends BasePlateformServlet{
	private static final long serialVersionUID = 1L;
	public final static String ApplicationConfigFile = "application.cfg.xml";
	public final static String HibernateConfigFile = "hibernate.example.xml";
	
	public void init() throws ServletException{
		super.init();
		//初始化 application
		Application app = initApplicationConfig(this.ContextPath);
		
		if(app!=null){
			//循环所有local组件
			for(String cmpName:app.getComponentKeySet()){
				Component componentInfo = app.getComponent(cmpName);
				if(componentInfo.isLocalComponent()){
					LocalComponent lc = (LocalComponent)componentInfo;
					//初始化所有组件
					lc.initialize();
					//发布webservice服务
					lc.publish();
				}
			}
		}else{
			System.err.println("---------------------------------------");
			System.err.println("当前应用初始化失败，请修改后重试！");
			System.err.println("---------------------------------------");
		}
	}

	
	private Application initApplicationConfig(String contextPath){
		Application app = null;
		try {
			//读取web-inf/application.cfg.xml 如果不存在 复制参考文件到目标目录 并提示错误
			File cfgFile = new File(contextPath+"WEB-INF/"+ApplicationConfigFile);
			if(!cfgFile.exists()){
				//复制文件
				InputStream ins = ApplicationInitialServlet.class.getResourceAsStream("/"+ApplicationConfigFile);
				OutputStream os = new FileOutputStream(cfgFile);
				int bytesRead = 0;
				byte[] buffer = new byte[8192];
				while ((bytesRead = ins.read(buffer, 0, 8192)) != -1) {
					os.write(buffer, 0, bytesRead);
				}
				os.close();
				ins.close();
				System.err.println("应用程序配置文件：WEB-INF/"+ApplicationConfigFile+"不存在,已创建示例文件，请修改后重新启动！");
				return null;
			}
			
			SAXReader reader = new SAXReader();
			reader.setEncoding("utf-8");
			Document configurationDoc = reader.read(cfgFile);
			Element appEl = configurationDoc.getRootElement();//server  XML:ROOT-EL

			String serverName = appEl.attributeValue("name");
			String serverTitle = appEl.attributeValue("title");
			String serverSrcPath = appEl.attributeValue("src");
			String serverModule = appEl.attributeValue("module");
			String serverJdkPath = appEl.attributeValue("jdkPath");
			String serverIp = appEl.attributeValue("ip");
			String serverPort = appEl.attributeValue("port");
			String serverWebservicePort = appEl.attributeValue("webservicePort");
			String serverWebserviceSrc = appEl.attributeValue("webserviceSrc");
			app = Application.init(contextPath,serverName, serverTitle, serverSrcPath,serverModule,serverJdkPath, serverIp, serverPort, serverWebservicePort, serverWebserviceSrc);

			Element pagesEl = appEl.element("pages");
			Element loginPageEl = pagesEl.element("login");
			Element homePageEl = pagesEl.element("home");
			app.setHomePage(homePageEl.attributeValue("page"));
			app.setLoginPage(loginPageEl.attributeValue("page"));
			
			Element componentsEl = appEl.element("components");
			//component 本地组件
			@SuppressWarnings("unchecked")
			List<Element> localComponentEls = (List<Element>)componentsEl.elements("localComponent");
			for(Element localComponentEl : localComponentEls){
				String cmpName = localComponentEl.attributeValue("name");
				if(cmpName == null){
					System.err.println("组件名称不存在,忽略此组件！");
				}else{
					LocalComponent componentInfo = new LocalComponent(cmpName);
					//从组件同名配置文件中 取得webservice配置信息
					Document componentCfgDoc = reader.read(ApplicationInitialServlet.class.getResourceAsStream("/"+cmpName+".cfg.xml"));
					Element componentCfgRootEl = componentCfgDoc.getRootElement();//
					if(!cmpName.equals(componentCfgRootEl.attributeValue("name"))){
						System.err.println("组件配置文件：WEB-INF/classes/"+cmpName+".cfg.xml中的名称与组件名称不符,忽略此组件的webservice服务配置！");
					}else{
						List<Element> webserviceEls = (List<Element>)componentCfgRootEl.elements("webservice");
						for(Element webserviceEl : webserviceEls){
							String wsName = webserviceEl.attributeValue("name");
							String wsClass = webserviceEl.attributeValue("class");
							LocalWebservice wsInfo = new LocalWebservice(componentInfo,wsName,wsClass);
							//记录此webservice
							componentInfo.addWebservice(wsInfo);
						}
					}
					//记录此组件
					app.addComponent(componentInfo);
				}
			}
			
			//component 远程组件
			@SuppressWarnings("unchecked")
			List<Element> remoteComponentEls = (List<Element>)componentsEl.elements("remoteComponent");
			for(Element remoteComponentEl : remoteComponentEls){
				String cmpName = remoteComponentEl.attributeValue("name");
				String cmpIp = remoteComponentEl.attributeValue("ip");
				String cmpWsPort = remoteComponentEl.attributeValue("port");
				if(cmpName == null){
					System.err.println("组件名称不存在,忽略此组件！");
				}else{
					RemoteComponent componentInfo = new RemoteComponent(cmpName, cmpIp, cmpWsPort);
					//从组件同名配置文件中 取得webservice配置信息
					Document componentCfgDoc = reader.read(ApplicationInitialServlet.class.getResourceAsStream("/"+cmpName+".cfg.xml"));
					Element componentCfgRootEl = componentCfgDoc.getRootElement();//
					if(!cmpName.equals(componentCfgRootEl.attributeValue("name"))){
						System.err.println("组件配置文件：WEB-INF/classes/"+cmpName+".cfg.xml中的名称与组件名称不符,忽略此组件的webservice服务配置！");
					}else{
						List<Element> webserviceEls = (List<Element>)componentCfgRootEl.elements("webservice");
						for(Element webserviceEl : webserviceEls){
							String wsName = webserviceEl.attributeValue("name");
							String wsClientClass = webserviceEl.attributeValue("clientClass");
							String wsClientServiceClass = webserviceEl.attributeValue("clientServiceClass");
							RemoteWebservice wsInfo = new RemoteWebservice(componentInfo, wsName, wsClientClass, wsClientServiceClass);
							//记录此webservice
							componentInfo.addWebservice(wsInfo);
						}
					}
					//记录此组件
					app.addComponent(componentInfo);
				}
			}
			//session factory 配置
			Element sessionFactoryEl = appEl.element("sessionFactory");
			String sessionFactoryFileName = sessionFactoryEl.attributeValue("cfgFileName");
			
			JSONObject sessionConfig = new JSONObject();
			sessionConfig.put("cfgFileName", sessionFactoryFileName);
			
			JSONArray xiTongConfigs = new JSONArray();
			List<Element> xiTongEls = (List<Element>)sessionFactoryEl.elements("xiTong");
			for(Element xiTongEl : xiTongEls){
				JSONObject xiTongConfig = JSONConvertUtils.applyXML2Json(xiTongEl,false);
				
				xiTongConfigs.add(xiTongConfig);
			}
			
			sessionConfig.put("xiTongs", xiTongConfigs);

			File sessionFactoryFile = new File(contextPath+sessionFactoryFileName);
			if(!sessionFactoryFile.exists()){
				//复制文件
				InputStream ins = ApplicationInitialServlet.class.getResourceAsStream("/"+HibernateConfigFile);
				OutputStream os = new FileOutputStream(sessionFactoryFile);
				int bytesRead = 0;
				byte[] buffer = new byte[8192];
				while ((bytesRead = ins.read(buffer, 0, 8192)) != -1) {
					os.write(buffer, 0, bytesRead);
				}
				os.close();
				ins.close();
				System.err.println("hiernate配置文件("+sessionFactoryFile.getPath()+")不存在,已创建示例文件，请修改后重新启动！");
			}
			//HibernateSessionFactory初始化（添加必要的mapping）
			HibernateSessionFactory.initial(sessionFactoryFile,sessionConfig);
			//检查实体类版本是否一致 
			//是否需要根据实体类定义文件 重新生成java类 hbm文件 实体类数据
			if(!EntityManager.checkEntitySyn(contextPath)){
				app = null;
			}
			//添加其他mapping
			if(!HibernateSessionFactory.loadMappings()){
				app = null;
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			app = null;
		}
		return app;
	}
	
	

}