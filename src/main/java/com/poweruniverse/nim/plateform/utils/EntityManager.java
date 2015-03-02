package com.poweruniverse.nim.plateform.utils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

import net.sf.json.JSONArray;
import net.sf.json.JSONNull;
import net.sf.json.JSONObject;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.Node;
import org.dom4j.io.SAXReader;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

import com.poweruniverse.nim.data.entity.ShiTiLei;
import com.poweruniverse.nim.data.entity.XiTong;
import com.poweruniverse.nim.data.entity.ZiDuan;
import com.poweruniverse.nim.data.entity.ZiDuanLX;
import com.poweruniverse.nim.data.service.utils.HibernateSessionFactory;
import com.poweruniverse.nim.data.service.utils.JSONConvertUtils;

import freemarker.template.Configuration;
import freemarker.template.Template;

public class EntityManager {
	private static String versionPattern = "version:";

	private static String entityPackage = "com.poweruniverse.oim.server.entity";
	
	private static SimpleDateFormat dateFm = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); //日期格式化
	//检查是否同步
	//根据hbm文件中的时间戳 检查java文件 是否需要生成新的版本
	public static boolean checkEntitySyn(String contextPath){
		Session sess = null;
		boolean ret = true;
		try {
			sess = HibernateSessionFactory.getSession(HibernateSessionFactory.defaultSessionFactory);
			
			Map<String, JSONObject> cFileNameMap =  HibernateSessionFactory.getConfigurationMap();
			Iterator<String> keys = cFileNameMap.keySet().iterator();
			while(keys.hasNext()){
				JSONObject sessionConfig = cFileNameMap.get(keys.next());
				if(!checkHibernateCfgSyn(contextPath,sessionConfig,new File(contextPath+sessionConfig.getString("cfgFileName")))){
					ret = false;
					break;
				}
			}
		} catch (Exception e) {
			ret = false;
			e.printStackTrace();
			if(sess!=null){
				HibernateSessionFactory.closeSession(HibernateSessionFactory.defaultSessionFactory,false);
			}
		}finally{
			if(sess!=null){
				HibernateSessionFactory.closeSession(HibernateSessionFactory.defaultSessionFactory,true);
			}
		}
		return ret;
	}
	
	/**
	 * 检查单个hibernate 配置文件中的定义 是否同步
	 * @return
	 */
	private static boolean checkHibernateCfgSyn(String contextPath,JSONObject sessionConfig,File cfgFile) throws Exception{
		String entitySrcPath = sessionConfig.getString("srcPath");
		String entityClassesPath = sessionConfig.getString("classesPath");
		//解析hiernate.cfg.xml文件 
		SAXReader reader = new SAXReader();
		reader.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
		Document configurationDoc = reader.read(new FileInputStream(cfgFile));
		
		List<?> mappings = configurationDoc.getRootElement().element("session-factory").elements("mapping");
		List<File> tobeCompiled = new ArrayList<File>();
		List<ShiTiLei> tobeCreated = new ArrayList<ShiTiLei>();
		Map<String, JSONObject> resourceDefineMap = new HashMap<String, JSONObject>();
		for(int i=0;i<mappings.size();i++){
			Element mappingEl = (Element)mappings.get(i) ;
			String resourceName = mappingEl.attributeValue("resource");//hbm/system/XiTong.hbm.xml
			String entityName = resourceName.substring(0,resourceName.lastIndexOf("."));//hbm/system/XiTong
			
			Date defineVersion = null;
			Date classVersion = null;
			Date hbmVersion = null;
			
			//读取定义文件
			String defJsonString = null;
			File defJsonFile = new File(entityClassesPath+entityName+".def.json");//从执行路径读取定义文件
			if(!defJsonFile.exists()){
				//根据资源路径 检查是否存在定义文件
				InputStream ri = EntityManager.class.getResourceAsStream("/"+entityName+".def.json");
				if(ri==null){
					defJsonString = IOUtils.toString(ri, "utf8");
				}
			}else{
				defJsonString = FileUtils.readFileToString(defJsonFile, "utf8");
			}
			//解析定义文件
			JSONObject defJson = null;
			if(defJsonString==null){
				System.err.println("实体类("+entityName+")的定义文件不存在,忽略java文件和hbm文件的版本检查");
				continue;
			}else{
				try {
					defJson = JSONObject.fromObject(defJsonString);
				} catch (Exception e) {
					System.err.println("实体类("+entityName+")的定义文件不是有效的json对象,忽略java文件和hbm文件的版本检查");
					continue;
				}
			}
			
			if(defJson!=null){
				resourceDefineMap.put(resourceName, defJson);
				defineVersion = dateFm.parse(defJson.getString("shiTiLeiBB"));
				
				if(defineVersion!=null){
					//取得 java基础类中 的版本信息
					try {
						String className = defJson.getString("shiTiLeiClassName");
						String baseClassName = className.substring(0, className.lastIndexOf(".") + 1)+"base.Base"+className.substring(className.lastIndexOf(".")+1);
						//取得class类中的版本信息
						Class<?> shiTiLeiClass = null;
						try {
							shiTiLeiClass = Class.forName(baseClassName);
						} catch (ClassNotFoundException e1) {
							
						}
						if(shiTiLeiClass==null){
							System.out.println("实体类的抽象父类("+baseClassName+")不存在,需要重新生成。");
							tobeCompiled.addAll(updateJava(defJson,entitySrcPath));
						}else if(!shiTiLeiClass.isAnnotationPresent(Version.class)){
							System.out.println("实体类的抽象父类("+baseClassName+")的中没有版本号定义,需要重新生成。");
							tobeCompiled.addAll(updateJava(defJson,entitySrcPath));
						}else{
							try {
								Version v = shiTiLeiClass.getAnnotation(Version.class); 
								Method m = v.getClass().getDeclaredMethod("value", null);  
				                String value = (String) m.invoke(v, null);
								classVersion = dateFm.parse(value);
							} catch (Exception e) {
								classVersion = null;
							}
							
							if(classVersion==null){
								System.out.println("实体类的抽象父类("+baseClassName+")的版本号不是一个有效的日期,需要重新生成。");
								tobeCompiled.addAll(updateJava(defJson,entitySrcPath));
							}else if(defineVersion.after(classVersion)){
								System.out.println("实体类("+entityName+")的java类版本("+(classVersion==null?"null":dateFm.format(classVersion))+")早于定义信息("+dateFm.format(defineVersion)+")，需要重新生成。");
								tobeCompiled.addAll(updateJava(defJson,entitySrcPath));
							}
						}
					} catch (Exception e) {
						e.printStackTrace();
					}
					
					//根据资源路径 检查是否存在定义文件
					InputStream mappingFileStream = EntityManager.class.getResourceAsStream("/"+resourceName);
					if(mappingFileStream==null){
						System.out.println("实体类("+entityName+")hbm文件的版本信息不存在，需要重新生成。");
						updateHBM(entitySrcPath,entityClassesPath,defJson);
					}else{
						try {
							Document mappingDoc = reader.read(mappingFileStream);
							for(int j = 0;j<mappingDoc.nodeCount();j++){
								Node node = mappingDoc.node(j);
								if(node.getNodeType() == Node.COMMENT_NODE){
									//在第一个注释节点中 查找版本号
									String nodeText = node.getText();
									if(nodeText.indexOf(versionPattern) > 0){
										String versionVal = nodeText.substring(nodeText.indexOf(versionPattern) +versionPattern.length()).trim();
										hbmVersion = dateFm.parse(versionVal);
									}
								}
							}
						} catch (Exception e) {
							hbmVersion = null;
							System.out.println("读取实体类("+entityName+")的hbm文件失败，假定版本号为空。");
						}
						if(hbmVersion != null){
							if(defineVersion.after(hbmVersion)){
								System.out.println("实体类("+entityName+")的hbm文件版本("+dateFm.format(hbmVersion)+")早于定义版本("+dateFm.format(defineVersion)+")，需要重新生成。");
								//需要重新生成hbm文件
								updateHBM(entitySrcPath,entityClassesPath,defJson);
							}
						}else {
							System.out.println("实体类("+entityName+")hbm文件的版本信息不存在，需要重新生成。");
							//需要重新生成hbm文件
							updateHBM(entitySrcPath,entityClassesPath,defJson);
						}
					}
				}else{
					System.err.println("实体类("+entityName+")的定义文件中无版本信息,忽略java文件和hbm文件的版本检查");
				}
			}
		}
		//编译生成的java文件
		if(tobeCompiled.size()>0){
			compileFile(contextPath,tobeCompiled);
		}
		
		//再循环一次 检查是否所有实体类都已创建
		Session sess = HibernateSessionFactory.getSession(HibernateSessionFactory.defaultSessionFactory);
		for(int i=0;i<mappings.size();i++){
			Element mappingEl = (Element)mappings.get(i) ;
			String resourceName = mappingEl.attributeValue("resource");//hbm/system/XiTong.hbm.xml
			//读取定义文件中的版本信息,创建不存在的实体类
			JSONObject defJson = resourceDefineMap.get(resourceName);
			if(defJson !=null ){
				try {
					//取实体类信息
					ShiTiLei stl = (ShiTiLei)sess.createCriteria(ShiTiLei.class).add(Restrictions.eq("shiTiLeiDH", defJson.getString("shiTiLeiDH"))).uniqueResult();
					if(stl == null){
						//不存在 创建之
						stl = new ShiTiLei();
						stl.setBiaoMing(defJson.getString("biaoMing"));
						stl.setShiTiLeiMC(defJson.getString("shiTiLeiMC"));
						stl.setShiTiLeiDH(defJson.getString("shiTiLeiDH"));
						stl.setShiTiLeiClassName(defJson.getString("shiTiLeiClassName"));
						stl.setZhuJianLie(defJson.getString("zhuJianLie"));
						stl.setXianShiLie(defJson.getString("xianShiLie"));
						stl.setPaiXuLie(defJson.getString("paiXuLie"));
						System.out.println("<===添加实体类："+stl.getShiTiLeiDH()+"("+stl.getShiTiLeiMC()+")");
						sess.save(stl);
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		
		//第三次循环 同步所有版本较老的实体类定义
		for(int i=0;i<mappings.size();i++){
			Element mappingEl = (Element)mappings.get(i) ;
			String resourceName = mappingEl.attributeValue("resource");//hbm/system/XiTong.hbm.xml
			
			//读取定义文件中的版本信息,创建不存在的实体类
			JSONObject defJson = resourceDefineMap.get(resourceName);
			if(defJson!=null ){
				Date defineVersion = dateFm.parse(defJson.getString("shiTiLeiBB"));
				//取实体类信息
				boolean needsUpdate = false;
				ShiTiLei stl = (ShiTiLei)sess.createCriteria(ShiTiLei.class).add(Restrictions.eq("shiTiLeiDH", defJson.getString("shiTiLeiDH"))).uniqueResult();
				if(stl.getShiTiLeiBB() == null){
					needsUpdate = true;
				}else{
					Date stlVersion = dateFm.parse(stl.getShiTiLeiBB());
					if(stlVersion == null || defineVersion.after(stlVersion) ){
						needsUpdate = true;
					}
				}
				if(needsUpdate){
					System.out.println("实体类("+resourceName+")的数据库版本为"+stl.getShiTiLeiBB()+"早于定义版本"+dateFm.format(defineVersion)+",需要更新！");
					applyDef2Obj(stl, defJson);
					sess.update(stl);
					
					tobeCreated.add(stl);
				}
			}else{
				System.err.println("实体类("+resourceName+")的定义文件不存在,忽略数据库中实体类的版本检查");
			}
		}
		//更新/创建表结构
		for(ShiTiLei stl:tobeCreated){
			createTable(stl,stl.getBiaoMing());
		}
		return true;
	
	}
	/**
	 * 根据数据库中的记录 创建实体类定义文件 记录实体类及字段的信息以及版本
	 */
	public static void createEntityDefine(ShiTiLei entityObj,String entitySrcPath){
		Session sess = null;
		try {
			sess = HibernateSessionFactory.getSession(HibernateSessionFactory.defaultSessionFactory);
			String versionString = dateFm.format(Calendar.getInstance().getTime());
			//实体类本身的定义
			ShiTiLei stlDef = (ShiTiLei)sess.load(ShiTiLei.class, 190);
			//字段定义
			java.net.URL uu = EntityManager.class.getResource("fields.json");

			File fieldsJsonFile = new File(uu.getFile());
			String fieldsString = FileUtils.readFileToString(fieldsJsonFile);
			JSONArray fieldsArray = JSONArray.fromObject(fieldsString);
			
			List<ShiTiLei> stls = (List<ShiTiLei>)sess.createCriteria(ShiTiLei.class).list();
			for(ShiTiLei stl:stls){
				String className = stl.getShiTiLeiClassName();//com.poweruniverse.oim.server.entity.system.BuMen
				String packageName = className.substring(entityPackage.length()+1);//system.BuMen
				String packagePath = packageName.replaceAll("\\.", "/");//system/BuMen
				
				File defineFile = new File(entitySrcPath+"hbm/"+packagePath+".def.json");
				
				JSONObject jsonData = JSONConvertUtils.object2JSONObject(stlDef, stl, fieldsArray);
				if(!jsonData.containsKey("shiTiLeiBB") || (jsonData.get("shiTiLeiBB") instanceof JSONNull) ){
					jsonData.put("shiTiLeiBB", versionString);
				}
				//将文件写入
				FileUtils.writeStringToFile(defineFile, jsonData.toString());
			}
		} catch (HibernateException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	//根据define文件 创建java文件并编译
	private static List<File> updateJava(JSONObject stlDefJson,String entitySrcPath) throws Exception{
		BufferedWriter out = null;
		List<File> fs = new ArrayList<File>();
		
		Configuration freemarkerCfg = new Configuration();
//		freemarkerCfg.setDirectoryForTemplateLoading(new File(BaseService.contextPath+templateFilePath));
		
		freemarkerCfg.setClassForTemplateLoading(EntityManager.class,"");
		
		Template baseEntityTemplate = freemarkerCfg.getTemplate("baseEntity.ftl");
		baseEntityTemplate.setEncoding("UTF-8");
		
		Template entityTemplate = freemarkerCfg.getTemplate("entity.ftl");
		entityTemplate.setEncoding("UTF-8");

		//为模版准备数据 
		Map<String,Object> root = new HashMap<String,Object>();
		
		String classFullName = stlDefJson.getString("shiTiLeiClassName");
		String className = classFullName.substring(classFullName.lastIndexOf(".")+1);
		String classPackage = classFullName.substring(0, classFullName.lastIndexOf("."));
		String classBasePackage = classPackage+".base";
		
		String classPath = classPackage.replaceAll("\\.", "/")+"/";
		String classBasePath = classBasePackage.replaceAll("\\.", "/");
		
		//检查并创建目标目录
		File classBasePathFile = new File(entitySrcPath+classBasePath);
		if(!classBasePathFile.exists()){
			classBasePathFile.mkdirs();
		}
		//
		root.put("stl", stlDefJson);
        root.put("packageName", classPackage); 
        root.put("className", className); 
		//根据模版 生成 entity(不覆盖原有文件)
		File entitySrcFile = new File(entitySrcPath+classPath+className+".java");
		if(!entitySrcFile.exists()){
			System.out.println("准备创建java文件："+entitySrcFile.getPath());
			//为当前实体类生成java文件
			out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(entitySrcFile),"UTF-8"));
			entityTemplate.process(root,out);
			out.flush();
			out.close();
			out = null;
			
			fs.add(entitySrcFile);
		}
		
		//是否业务表
		String entityInterface = "";
		if(stlDefJson.getBoolean("shiFouYWB")){
			entityInterface = ",com.poweruniverse.oim.server.entity.system.base.BusinessI";
		}else{
			entityInterface = ",com.poweruniverse.oim.server.entity.system.base.EntityI";
		}
        root.put("stl", stlDefJson); 
        root.put("entityInterface", entityInterface); 
		//根据模版 生成 baseEntity （覆盖原有文件）
		File baseEntitySrcFile = new File(entitySrcPath+classPath+"base/Base"+className+".java");
		System.out.println("准备创建base java文件："+baseEntitySrcFile.getPath());
		out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(baseEntitySrcFile),"UTF-8"));
		baseEntityTemplate.process(root,out);
		out.flush();
		out.close();
		out = null;
		
		fs.add(baseEntitySrcFile);
		return fs;
	}
	
	
	//根据define文件 创建hbm文件
	private static boolean updateHBM(String hbmSrcPath,String hbmClassesPath,JSONObject stlDefJson) throws Exception{
		Configuration freemarkerCfg = new Configuration();
		freemarkerCfg.setClassForTemplateLoading(EntityManager.class,"");
		
		Template hbmTemplate = freemarkerCfg.getTemplate("hbm.ftl");
		hbmTemplate.setEncoding("UTF-8");

		//为模版准备数据 
		Map<String,Object> root = new HashMap<String,Object>();
		root.put("stl", stlDefJson); 
		
		String classFullName = stlDefJson.getString("shiTiLeiClassName");//com.poweruniverse.oim.server.entity.system.BuMen
		String entityName = classFullName.substring(entityPackage.length()+1);//system.BuMen
		String hbmFilePart = entityName.replaceAll("\\.", "/")+".hbm.xml";// system/BuMen.hbm.xml

		String entityPackage = entityName.substring(0, entityName.lastIndexOf("."));//system
		String hbmPathPart = entityPackage.replaceAll("\\.", "/")+"/";// hbm/system/

		File hbmPathFile = new File(hbmSrcPath+hbmPathPart);
		if(!hbmPathFile.exists()){
			hbmPathFile.mkdirs();
		}
		//根据模版 生成 hbm （覆盖原有文件）
		File hbmSrcFile = new File(hbmSrcPath+hbmFilePart);
		System.out.println("准备创建hbm文件："+hbmSrcFile.getPath());
		BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(hbmSrcFile),"UTF-8"));
		hbmTemplate.process(root,out);
		out.flush();
		out.close();
		out = null;
		//将文件覆盖到classes目录
		File hbmclass = new File(hbmClassesPath+hbmPathPart);
		System.out.println("准备拷贝hbm文件："+hbmclass.getPath());
		FileUtils.copyFileToDirectory(hbmSrcFile, hbmclass);
		return true;
	}

	private static void compileFile(String contextPath,List<File> javaFiles){
		StandardJavaFileManager fileManager = null;
		try {
			JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
			fileManager = compiler.getStandardFileManager(null, null, null);
			
			//编译源文件 
			Iterable<? extends JavaFileObject> compilationUnits = fileManager.getJavaFileObjectsFromFiles(javaFiles);
			String classesPath = contextPath+"WEB-INF/classes/";
			String classPath = classesPath+";"+contextPath+"WEB-INF/lib/json-lib-2.4.jar;"+contextPath+"WEB-INF/lib/dom4j-1.6.1.jar";
			
			Iterable<String> options = Arrays.asList("-source","1.6","-target","1.6","-d", classesPath,"-classpath",classPath);
			
			compiler.getTask(null, fileManager, null, options, null, compilationUnits).call();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	//将定义信息中的实体类信息 更新到实体类对象中
	public static Object applyDef2Obj(Object obj,JSONObject dataObject) throws Exception{
		if(dataObject==null) return obj;
		
		Session sess = HibernateSessionFactory.getSession(HibernateSessionFactory.defaultSessionFactory);
		
		Iterator<?> properties = dataObject.keys();
		while(properties.hasNext()){
			String propertyName = properties.next().toString();
			Object propertyValue = dataObject.get(propertyName);
			if(propertyName.equals("shiTiLeiDM") || propertyName.equals("ziDuanDM") ){
				continue;
			}
			if(propertyValue instanceof JSONObject){
				//对象类型 根据代号字段 取得关联对象
				Object propertyObj = null;
				if(propertyName.equals("xiTong")){
					String xiTongDH = ((JSONObject)propertyValue).getString("xiTongDH");
					propertyObj = sess.createCriteria(XiTong.class).add(Restrictions.eq("xiTongDH", xiTongDH)).uniqueResult();
				}else if(propertyName.equals("ziDuanLX")){
					String ziDuanLXDH = ((JSONObject)propertyValue).getString("ziDuanLXDH");
					propertyObj = sess.createCriteria(ZiDuanLX.class).add(Restrictions.eq("ziDuanLXDH", ziDuanLXDH)).uniqueResult();
				}else if(propertyName.equals("guanLianSTL")){
					String shiTiLeiDH = ((JSONObject)propertyValue).getString("shiTiLeiDH");
					propertyObj = sess.createCriteria(ShiTiLei.class).add(Restrictions.eq("shiTiLeiDH", shiTiLeiDH)).uniqueResult();
				}else if(propertyName.equals("guanLianFLZDObj")){
					String ziDuanDH = ((JSONObject)propertyValue).getString("ziDuanDH");
					propertyObj = sess.createCriteria(ZiDuan.class)
							.add(Restrictions.eq("ziDuanDH", ziDuanDH))
							.createAlias("shiTiLei", "zd_stl")
							.add(Restrictions.eq("zd_stl.shiTiLeiDH", ((JSONObject)propertyValue).getJSONObject("shiTiLei").getString("shiTiLeiDH")))
							.uniqueResult();
				}else{
					throw new Exception("在更新实体类对象时，发现未定义处理方式的对象类型字段："+propertyName);
				}
				PropertyUtils.setProperty(obj,propertyName,propertyObj);
			}else if(propertyValue instanceof JSONArray){
				//集合类型
				if(propertyName.equals("zds")){
					//删除原有字段
					ShiTiLei stl = (ShiTiLei)obj;
					JSONArray zdArray = (JSONArray)propertyValue;
					List<ZiDuan> tobeDeleted = new ArrayList<ZiDuan>();
					for(ZiDuan zd :stl.getZds()){
						boolean isZdExists = false;
						for(int i=0;i<zdArray.size();i++){
							if(zdArray.getJSONObject(i).getString("ziDuanDH").equals(zd.getZiDuanDH())){
								isZdExists = true;
								break;
							}
						}
						if(!isZdExists){
							System.out.println("===>删除字段："+stl.getShiTiLeiDH()+"."+zd.getZiDuanDH()+"("+stl.getShiTiLeiMC()+"."+zd.getZiDuanBT()+")");
							tobeDeleted.add(zd);
						}
					}
					stl.getZds().removeAll(tobeDeleted);
					//添加新增的字段（更新存在的字段）
					for(int i=0;i<zdArray.size();i++){
						String ziDuanDH = zdArray.getJSONObject(i).getString("ziDuanDH");
						if(stl.hasZiDuan(ziDuanDH)){
							ZiDuan zd = stl.getZiDuan(ziDuanDH);
							applyDef2Obj(zd, zdArray.getJSONObject(i));
						}else{
							ZiDuan zd = new ZiDuan();
							applyDef2Obj(zd, zdArray.getJSONObject(i));
							zd.setShiTiLei(stl);
							stl.getZds().add(zd);
							System.out.println("<===添加字段："+stl.getShiTiLeiDH()+"."+zd.getZiDuanDH()+"("+stl.getShiTiLeiMC()+"."+zd.getZiDuanBT()+")");
						}
					}
//				}else if (propertyName.equals("shiTiLeiLX")){
//					String shiTiLeiLXDH = ((JSONObject)propertyValue).getString("shiTiLeiLXDH");
//					propertyObj = sess.createCriteria(ShiTiLeiLX.class).add(Restrictions.eq("shiTiLeiLXDH", shiTiLeiLXDH)).uniqueResult();
				}else{
					throw new Exception("在更新实体类对象时，发现未定义处理方式的对象类型字段："+propertyName);
				}
			}else{
				PropertyUtils.setProperty(obj,propertyName,propertyValue);
			}
		}
		return obj;
	}
	
	public static boolean createTable(ShiTiLei obj,String tableName) throws Exception{
		Session sess = HibernateSessionFactory.getSession(HibernateSessionFactory.defaultSessionFactory);
		String sql = null;
		sql="select count(*) from user_tables where table_name = '"+tableName.toUpperCase()+"'";
		int count = ((Number)sess.createSQLQuery(sql).uniqueResult()).intValue();
		if(count==0){
			sql = "create table "+tableName+" ("+obj.getZhuJianLie()+" number(12) not null primary key)";
			sess.createSQLQuery(sql).executeUpdate();
		}
		sql = "comment on table "+tableName+" is '"+obj.getShiTiLeiMC()+"'";
		sess.createSQLQuery(sql).executeUpdate();
		//取得表中所有已存在的字段名 以及
		sql = "select col.column_name,col.data_type," +
				"case col.data_type when 'VARCHAR2' then col.data_length else col.data_precision end," +
				"col.data_scale,col.nullable,comm.comments " +
				"from user_tab_columns col left outer join user_col_comments comm " +
				"on col.TABLE_NAME = comm.TABLE_NAME and col.column_name = comm.column_name " +
				"where col.TABLE_NAME=upper('"+tableName+"')";
		Iterator<?> colResults = sess.createSQLQuery(sql).list().iterator();
		Object[] colResult = null;
		String colName = null;
		String colType = null;
		int colWidth = 0;
		int colScale = 0;
		boolean allowNull = false;
		String colComment = null;
		ZiDuan ziDuan = null;
		while(colResults.hasNext()){
			colResult = (Object[])colResults.next();
			colName = (String)colResult[0];
			colType = (String)colResult[1];
			colWidth = colResult[2]==null?0:((BigDecimal)colResult[2]).intValue();
			colScale = colResult[3]==null?0:((BigDecimal)colResult[3]).intValue();
			allowNull = "Y".equals(colResult[4]);
			colComment = (String)colResult[5];
			//
			//取列名一致的ZiDuan对象
			@SuppressWarnings("unchecked")
			List<ZiDuan> zds = (List<ZiDuan>)sess.createCriteria(ZiDuan.class)
				.add(Restrictions.eq("shiTiLei.id",obj.getShiTiLeiDM()))
				.add(Restrictions.sqlRestriction("upper(lieMing)='"+colName+"'"))
				.list();
			if(zds.size()==1){
				ziDuan = (ZiDuan)zds.get(0);
				int ziDuanCD = ziDuan.getZiDuanCD()==null?0:ziDuan.getZiDuanCD().intValue();
				int ziDuanJD = ziDuan.getZiDuanJD()==null?0:ziDuan.getZiDuanJD().intValue();
				//如果是对象类型 字段的宽度应该从关联实体类的主键中取得
				if(ziDuan.getZiDuanLX().getZiDuanLXDH().equals("object")){
					ziDuanCD = ziDuan.getGuanLianSTL().getZiDuan(ziDuan.getGuanLianSTL().getZhuJianLie()).getZiDuanCD().intValue();
				}
				//逻辑型 字段的宽度为2
				if(ziDuan.getZiDuanLX().getZiDuanLXDH().equals("boolean")){
					ziDuanCD = 1;
				}
				boolean compareOK = true;
				boolean typeOK = true;
				//检查字段类型是否相符
				String oracleType = ziDuan.getZiDuanLX().getOracleType();
				if(!oracleType.equals(colType)){
					compareOK = false;
					typeOK = false;
				}
				if(OracleType.hasWidth(oracleType)){
					//检查字段长度是否相符
					if(ziDuanCD!= colWidth){
						if(ziDuanCD>colWidth){
							compareOK = false;
						}
					}
				}
				//检查字段小数位是否相符
				if(OracleType.hasDec(oracleType)){
					if(ziDuanJD> colScale){
						compareOK = false;
					}
				}
				//以上检查是否通过'
				if(!compareOK){
//					Transaction trans = null;
    				try{
    					if(typeOK){
    						sql = "alter table " + tableName + " modify " + colName + " " + 
        							OracleType.getColumnSyntax(ziDuan.getZiDuanLX().getOracleType(), ziDuanCD, ziDuanJD);
        					sess.createSQLQuery(sql).executeUpdate();
    					}else{
    						//添加过渡字段
    						sql = "alter table " + tableName + " add " + colName + "_old " + 
        							OracleType.getColumnSyntax(colType, colWidth, colScale);
        					sess.createSQLQuery(sql).executeUpdate();
    						//将原值放置到过渡字段中
        					sql = "update " + tableName + " set " + colName + "_old = " + colName;
        					sess.createSQLQuery(sql).executeUpdate();
        					//删除原字段
        					sql = "alter table " + tableName + " drop column " + colName ;
        					sess.createSQLQuery(sql).executeUpdate();
        					//添加新字段
        					sql = "alter table " + tableName + " add " + colName + " " + 
        							OracleType.getColumnSyntax(ziDuan.getZiDuanLX().getOracleType(), ziDuanCD, ziDuanJD);
        					sess.createSQLQuery(sql).executeUpdate();
        					//取得过渡字段中暂存的值
        					sql = "update " + tableName + " set " + colName + " = " + colName+"_old";
        					sess.createSQLQuery(sql).executeUpdate();
        					//删除过渡字段
        					sql = "alter table " + tableName + " drop column " + colName+"_old";
        					sess.createSQLQuery(sql).executeUpdate();
    					}
    				}catch(Exception se){
    					System.out.println(obj.getShiTiLeiMC()+" error sql:"+sql);
    					se.printStackTrace();
//    					return this.createMessage("修改数据库列("+colName+")定义失败！");
    				}
				}
				//检查字段允许为空是否相符
				boolean yunXuKZ = true;
				//除了主键外 其他字段都允许为空
				if(ziDuan.getZiDuanDH().equals(obj.getZhuJianLie())){
					yunXuKZ = false;
				}
				if( yunXuKZ != allowNull){
    				try{
    					sql = "alter table " + tableName + " modify " + colName + 
    							(yunXuKZ?" null ":" not null")  ;
    					sess.createSQLQuery(sql).executeUpdate();
    				}catch(Exception se){
    					System.out.println(obj.getShiTiLeiMC()+" error sql:"+sql);
    					se.printStackTrace();
//    					return this.createMessage("修改数据库列("+colName+")允许为空状态失败！");
    				}
				}
				//检查字段备注是否相符
				if(!ziDuan.getZiDuanBT().equals(colComment)){
    				try{ 
    					sql = "comment on column "+tableName+"."+colName+" is '"+ziDuan.getZiDuanBT()+"'";
    					sess.createSQLQuery(sql).executeUpdate();
    				}catch(Exception se){
    					System.out.println(obj.getShiTiLeiMC()+" error sql:"+sql);
    					se.printStackTrace();
//    					return this.createMessage("修改数据库列("+colName+")备注信息失败！");
    				}
				}
			}else if (zds.size()==0){
				//字段定义不存在 删除表中实际存在的字段
				//删除新列
			}else{
				throw new Exception(obj.getShiTiLeiDH()+"定义的数据库列名("+colName+")重复！");
			}
		}
		//查询字段定义中存在 但表中不存在的字段
		Iterator<?> zds = sess.createCriteria(ZiDuan.class)
				.add(Restrictions.eq("shiTiLei.id",obj.getShiTiLeiDM()))
				.add(Restrictions.ne("ziDuanLX.id",8))//集合类型不生成字段
				.add(Restrictions.sqlRestriction("upper(lieMing) not in (select column_name from user_tab_columns t where t.TABLE_NAME=upper('"+tableName+"') )"))
				.list().iterator();
		while(zds.hasNext()){
			ziDuan = (ZiDuan)zds.next();
			int ziDuanCD = ziDuan.getZiDuanCD()==null?0:ziDuan.getZiDuanCD().intValue();
			int ziDuanJD = ziDuan.getZiDuanJD()==null?0:ziDuan.getZiDuanJD().intValue();
			//如果是对象类型 字段的宽度应该从关联实体类的主键中取得
			if(ziDuan.getZiDuanLX().getZiDuanLXDH().equals("object")){
				ziDuanCD = ziDuan.getGuanLianSTL().getZiDuan(ziDuan.getGuanLianSTL().getZhuJianLie()).getZiDuanCD().intValue();
			}
			//逻辑型 字段的宽度为1
			if(ziDuan.getZiDuanLX().getZiDuanLXDH().equals("boolean")){
				ziDuanCD = 1;
			}
			//如果是对象类型 字段的宽度应该从关联实体类的主键中取得
			if(ziDuan.getZiDuanLX().getZiDuanLXDH().equals("object")){
				ziDuanCD = ziDuan.getGuanLianSTL().getZiDuan(ziDuan.getGuanLianSTL().getZhuJianLie()).getZiDuanCD().intValue();
			}
			//检查字段类型
			if(ziDuan.getZiDuanLX()==null || ziDuan.getZiDuanLX().getOracleType()==null){
				throw new Exception("实体类'"+ziDuan.getShiTiLei().getShiTiLeiDH()+"'中的字段'"+ziDuan.getZiDuanDH()+"'未指定字段类型或此字段类型不允许创建列！");
			}
			//检查列名
			if(ziDuan.getLieMing()==null || ziDuan.getLieMing().length()==0){
				throw new Exception("实体类'"+ziDuan.getShiTiLei().getShiTiLeiDH()+"'中的字段'"+ziDuan.getZiDuanDH()+"'的列名为空！");
			}
			try{ 
				//
				String allowNulString = " not null";
				boolean yunXuKZ = ziDuan.getYunXuKZ()==null?false:ziDuan.getYunXuKZ().booleanValue();
				yunXuKZ = true;
				if( yunXuKZ ){
					allowNulString = " null";
				}
				//
				try{ 
					sql = "alter table "+tableName+" add "+ziDuan.getLieMing()+" "+ OracleType.getColumnSyntax(ziDuan.getZiDuanLX().getOracleType(), ziDuanCD, ziDuanJD) + allowNulString;
					sess.createSQLQuery(sql).executeUpdate();
				}catch(Exception se){
					sql = "alter table "+tableName+" add "+ziDuan.getLieMing()+" "+ OracleType.getColumnSyntax(ziDuan.getZiDuanLX().getOracleType(), ziDuanCD, ziDuanJD) + " null";
					sess.createSQLQuery(sql).executeUpdate();
				}
				sql = "comment on column "+tableName+"."+ziDuan.getLieMing()+" is '"+ziDuan.getZiDuanBT()+"'";
				sess.createSQLQuery(sql).executeUpdate();
			}catch(Exception se){
				se.printStackTrace();
			}
		}
		//自定义唯一约束
		//删除原有自定义唯一约束
		String constraintsDropString ="drop index UIDX_"+tableName+"_C ";
		try{ 
			sess.createSQLQuery(constraintsDropString).executeUpdate();
		}catch(Exception se){
//			System.out.println(obj.getShiTiLeiMC()+" error sql:"+sql);
//			se.printStackTrace();
		}
		//
		Iterator<?> yszds = sess.createCriteria(ZiDuan.class)
				.add(Restrictions.eq("shiTiLei.id",obj.getShiTiLeiDM()))
				.add(Restrictions.eq("shiFouWY",true))//设置了唯一索引的字段
				.list().iterator();
		if(yszds.hasNext()){
			//检查其他名称的同含义自定义唯一约束是否存在
			String constraintsCreateString ="create unique index UIDX_"+tableName+"_C on "+tableName+" (";
			String constraintsQueryString = "select count(*) ucount from user_constraints c where c.table_name = '"+tableName.toUpperCase()+"' and c.constraint_type = 'U' ";
			while(yszds.hasNext()){
				ziDuan = (ZiDuan)yszds.next();
				constraintsQueryString+=" and exists (select 1 from user_cons_columns cc"+ziDuan.getZiDuanDM()+
		                   " where cc"+ziDuan.getZiDuanDM()+".constraint_name = c.constraint_name and cc"+ziDuan.getZiDuanDM()+".column_name = '"+ziDuan.getLieMing().toUpperCase()+"') ";
				constraintsCreateString+= ziDuan.getLieMing()+(yszds.hasNext()?",":"");
			}
			constraintsCreateString+=")";
			
			List<?> ysResults = sess.createSQLQuery(constraintsQueryString).list();
			if(ysResults==null || ysResults.size()==0 || Integer.parseInt(""+ysResults.get(0))==0){
				//不存在 创建
				try{ 
					sess.createSQLQuery(constraintsCreateString).executeUpdate();
				}catch(Exception se){
//					System.out.println(obj.getShiTiLeiMC()+" error sql:"+constraintsCreateString);
//					se.printStackTrace();
				}
			}
		}
		return true;
	}
	
}
