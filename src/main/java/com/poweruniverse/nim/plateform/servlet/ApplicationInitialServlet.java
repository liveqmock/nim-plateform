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

import com.poweruniverse.nim.base.description.Application;
import com.poweruniverse.nim.base.description.Component;
import com.poweruniverse.nim.base.description.LocalComponent;
import com.poweruniverse.nim.base.description.LocalWebservice;
import com.poweruniverse.nim.base.description.RemoteComponent;
import com.poweruniverse.nim.base.description.RemoteWebservice;
import com.poweruniverse.nim.base.servlet.BasePlateformServlet;
import com.poweruniverse.nim.data.entity.EntityManager;
import com.poweruniverse.nim.data.entity.RegisterManager;
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
			System.out.println("---------------------------------------");
			//循环所有local组件
			for(String cmpName:app.getComponentKeySet()){
				Component componentInfo = app.getComponent(cmpName);
				if(componentInfo.isLocalComponent()){
					LocalComponent lc = (LocalComponent)componentInfo;
					//初始化本地组件
					lc.initialize();
					//通知本地组件发布webservice服务
					lc.publish();
				}else{
					RemoteComponent rc = (RemoteComponent)componentInfo;
					System.out.println("	远程组件("+rc.getName()+")的webservice服务在 "+rc.getIp()+":"+rc.getWebservicePort()+"运行");
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
			String serverMode = appEl.attributeValue("mode");
			String serverModule = appEl.attributeValue("module");
			String serverIp = appEl.attributeValue("ip");
			String serverPort = appEl.attributeValue("port");
			String serverWebservicePort = appEl.attributeValue("webservicePort");
			
			app = Application.init(contextPath,serverName, serverTitle,serverMode,serverModule, serverIp, serverPort, serverWebservicePort);
			
			Element developEl = appEl.element("develop");
			if(developEl!=null){
				String appSrcPath = developEl.attributeValue("appSrcPath");
				String jdkPath = developEl.attributeValue("jdkPath");
				
				//检查appSrcPath路径是否存在
				File appSrcPathFile = new File(appSrcPath);
				if(!appSrcPathFile.exists()){
					System.err.println("开发模式定义的应用系统源文件路径("+appSrcPath+")不存在！");
					System.err.println("已自动改变运行模式为：正式运行");
					Application.getInstance().setMode("work");
				}else{
					//检查jdkPath路径是否存在
					File jdkPathFile = new File(jdkPath);
					if(!jdkPathFile.exists()){
						System.err.println("开发模式定义的应用系统源文件路径("+jdkPath+")不存在！");
						System.err.println("已自动改变运行模式为：正式运行");
						Application.getInstance().setMode("work");
					}else{
						Application.setDevelopConfig(appSrcPath, jdkPath);
					}
				}
			}else if(Application.getInstance().isDevelopMode()){
				System.err.println("配置文件中运行模式为："+Application.getInstance().getMode()+",但未找到开发模式所需的develop定义信息");
				System.err.println("已自动改变运行模式为：正式运行");
				Application.getInstance().setMode("work");
			}
			
			System.out.println("-------------------------------------------");
			System.out.println("当前系统运行模式(平台开发plateform/应用开发application/正式运行work)："+Application.getInstance().getMode());
			System.out.println("-------------------------------------------");
			
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
					//在web-inf目录中查找组件配置文件
					Document componentCfgDoc = null;
					File componentCfgFile = new File(app.getContextPath()+"WEB-INF/"+cmpName+".component.xml");
					if(componentCfgFile.exists()){
						componentCfgDoc = reader.read(componentCfgFile);
					}else{
						//在类路径中查找组件配置文件
						InputStream is = ApplicationInitialServlet.class.getResourceAsStream("/"+cmpName+".component.xml");
						if(is!=null){
							componentCfgDoc = reader.read(is);
						}
					}
					//解析配置文件
					if(componentCfgDoc!=null){
						Element componentCfgRootEl = componentCfgDoc.getRootElement();//

						String cmpType = componentCfgRootEl.attributeValue("type");//组件类型：平台组件 、应用系统组件
						String clientSrcPath = componentCfgRootEl.attributeValue("clientSrcPath");
						String clientPackage = componentCfgRootEl.attributeValue("clientPackage");

						LocalComponent componentInfo = new LocalComponent(cmpName,cmpType,clientSrcPath,clientPackage);
						
						if(!cmpName.equals(componentCfgRootEl.attributeValue("name"))){
							System.err.println("组件配置文件："+cmpName+".component.xml中的名称与组件名称不符,忽略此组件的webservice服务配置！");
						}else{
							@SuppressWarnings("unchecked")
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
					}else{
						//在web-inf目录和类路径均未找到此组件的配置文件
						System.err.println("组件配置文件："+cmpName+".component.xml不存在,忽略此组件！");
					}
					
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
					
					
					//在web-inf目录中查找组件配置文件
					Document componentCfgDoc = null;
					File componentCfgFile = new File(app.getContextPath()+"WEB-INF/"+cmpName+".component.xml");
					if(componentCfgFile.exists()){
						componentCfgDoc = reader.read(componentCfgFile);
					}else{
						//在类路径中查找组件配置文件
						InputStream is = ApplicationInitialServlet.class.getResourceAsStream("/"+cmpName+".component.xml");
						if(is!=null){
							componentCfgDoc = reader.read(is);
						}
					}
					//从组件同名配置文件中 取得webservice配置信息
					if(componentCfgDoc==null){
						System.err.println("组件配置文件："+cmpName+".component.xml不存在,忽略此组件的webservice服务配置！");
					}else{
						Element componentCfgRootEl = componentCfgDoc.getRootElement();//
						if(!cmpName.equals(componentCfgRootEl.attributeValue("name"))){
							System.err.println("组件配置文件："+cmpName+".component.xml中的名称与组件名称不符,忽略此组件的webservice服务配置！");
						}else{
							String clientPackage = componentCfgRootEl.attributeValue("clientPackage");
							RemoteComponent componentInfo = new RemoteComponent(cmpName, cmpIp, cmpWsPort,clientPackage);
							
							@SuppressWarnings("unchecked")
							List<Element> webserviceEls = (List<Element>)componentCfgRootEl.elements("webservice");
							for(Element webserviceEl : webserviceEls){
								String wsName = webserviceEl.attributeValue("name");
								String wsCLass = webserviceEl.attributeValue("class");
								String wsClientServiceClass = clientPackage+"."+wsCLass.substring(wsCLass.lastIndexOf(".")+1);
										
								RemoteWebservice wsInfo = new RemoteWebservice(componentInfo, wsName, wsCLass, wsClientServiceClass);
								//记录此webservice
								componentInfo.addWebservice(wsInfo);
							}
							//记录此组件
							app.addComponent(componentInfo);
						}
					}
				}
			}
			//session factory 配置
			Element sessionFactoryEl = appEl.element("sessionFactory");
			String sessionFactoryFileName = sessionFactoryEl.attributeValue("cfgFileName");
			
			JSONObject sessionConfig = new JSONObject();
			sessionConfig.put("cfgFileName", sessionFactoryFileName);
			
			JSONArray xiTongConfigs = new JSONArray();
			@SuppressWarnings("unchecked")
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
			
			if(!HibernateSessionFactory.initial(sessionFactoryFile,sessionConfig)){
				//HibernateSessionFactory初始化（添加必要的mapping）
				app = null;
			}else if(!EntityManager.checkEntitySyn(contextPath)){
				//检查实体类版本是否一致 
				//是否需要根据实体类定义文件 重新生成java类 hbm文件 实体类数据
				app = null;
			}else if(!RegisterManager.checkRegisterSyn(contextPath)){
				//检查功能版本是否一致 
				//是否需要根据功能定义文件 重新生成action类 功能数据等
				app = null;
			}else if(!HibernateSessionFactory.loadMappings()){
				//添加其他mapping
				app = null;
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			app = null;
		}
		if(app==null){
			HibernateSessionFactory.close();
		}
		return app;
	}
	
	

}