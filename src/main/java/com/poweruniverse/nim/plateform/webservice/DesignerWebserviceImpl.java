package com.poweruniverse.nim.plateform.webservice;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;

import javax.annotation.Resource;
import javax.jws.WebParam;
import javax.jws.WebService;
import javax.xml.ws.WebServiceContext;

import net.sf.json.JSONObject;

import org.apache.commons.io.FileUtils;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.SAXReader;
import org.dom4j.io.XMLWriter;

import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.webservice.BasePlateformWebservice;
import com.poweruniverse.nim.data.pageParser.DesignerElParser;
import com.poweruniverse.nim.data.service.utils.JSONConvertUtils;

/**
 * 与设计器有关的服务接口
 * 1、读取系统组件定义信息
 * 2、读取页面配置信息
 * 3、保存页面配置信息
 *
 */
@WebService
public class DesignerWebserviceImpl extends BasePlateformWebservice{
	@Resource
	private WebServiceContext wsContext;
	
	public JSONMessageResult savePageDef(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="xmlFilePath") String xmlFilePath,
			@WebParam(name="pageDefineString") String pageDefineString){
		JSONMessageResult msg = null;
//		{
//			"type":"page",
//			"component":"page",
//			"children":[{
//				"type":"form",
//				"component":"simpleform",
//				"children":[{
//					"type":"fields",
//					"component":"fields",
//					"children":[{
//						"type":"number",
//						"component":"intfield"
//					}]
//				},{
//					"type":"buttons",
//					"component":"buttons"
//				}]
//			}]
//		}
		JSONObject pageDefineJson = JSONObject.fromObject(pageDefineString);
		XMLWriter output = null;
		try {
			Document doc = DocumentHelper.createDocument();
			Element cfgEl = doc.addElement("page");
			
			JSONConvertUtils.applyJson2XML(cfgEl,pageDefineJson);
			
			OutputFormat format = OutputFormat.createPrettyPrint(); //设置XML文档输出格式
			format.setEncoding("utf-8"); //设置XML文档的编码类型
			
			output = new XMLWriter(new FileOutputStream(new File(contextPath+"module/"+xmlFilePath)),format);
			output.write(doc);
			output.close();
			output =null;
			
			msg = new JSONMessageResult();
		}catch(Exception e){
			msg = new JSONMessageResult(e.getMessage());
		}finally{
			if(output!=null){
				try {
					output.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
				output =null;
			}
		}
		return msg;
	}
	
	/**
	 * 读取module目录下的页面文件 解析页面的定义信息
	 * @return
	 */
	public JSONMessageResult readPageDef(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="xmlFilePath") String xmlFilePath){
		JSONMessageResult msg = null;

		try {
			JSONObject pageDef = new JSONObject();
			
			File cfgFile = new File(contextPath+"module/"+xmlFilePath);
			if(cfgFile.exists()){
				SAXReader reader = new SAXReader();
				Document doc = reader.read(cfgFile);
				Element cfgEl = doc.getRootElement();
				
				pageDef = JSONConvertUtils.applyXML2Json(cfgEl,true);
				
				//兼容老代码 将页面标题字段名 从title改为label
				if(!pageDef.containsKey("label") && pageDef.containsKey("title")){
					pageDef.put("label", pageDef.getString("title")) ;
				}
			}
			msg = new JSONMessageResult("pageDef", pageDef);
		} catch (Exception e) {
			e.printStackTrace();
			msg = new JSONMessageResult("Exception："+e.getMessage());
		}
		return msg;
	}

	/**
	 * 将文件保存到module目录下（html css js文件 ）
	 * @return
	 */
	public JSONMessageResult saveFile(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl,
			@WebParam(name="content") String content){
		JSONMessageResult msg = null;
		try {
			String filePathName = pageUrl.replaceAll("\\.\\.", "");
			File cfgFile = new File(contextPath+"module/"+filePathName);
			FileUtils.writeStringToFile(cfgFile, content);
			msg = new JSONMessageResult();
		} catch (Exception e) {
			e.printStackTrace();
			msg = new JSONMessageResult("Exception："+e.getMessage());
		}
		return msg;
	}
	
	/**
	 * 读取module目录下的页面html css js文件 
	 * @return
	 */
	public JSONMessageResult readFile(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		JSONMessageResult msg = null;
		try {
			String filePathName = pageUrl.replaceAll("\\.\\.", "");
			File cfgFile = new File(contextPath+"module/"+filePathName);
			if(cfgFile.exists()){
				String fileContent = FileUtils.readFileToString(cfgFile,"utf-8");
				msg = new JSONMessageResult("content", fileContent);
			}else{
				msg = new JSONMessageResult("content", "");
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			msg = new JSONMessageResult("Exception："+e.getMessage());
		}
		return msg;
	}
	/**
	 * 读取web-inf/compnent.cfg.xml 文件 解析页面控件的定义信息
	 * @return
	 */
	public JSONMessageResult readCmpDef(@WebParam(name="contextPath") String contextPath){
		JSONMessageResult msg = null;
	
		XMLWriter output = null;
		try {
			JSONObject typeMap = new JSONObject();
			JSONObject cmpMap = new JSONObject();
			
			File designPath = new File(contextPath+"WEB-INF/designer");
			File[] designFiles = designPath.listFiles();
			//读取type定义
			for(File designFile:designFiles){
				if(designFile.getName().endsWith("xml")){
					SAXReader reader = new SAXReader();
					Document doc = reader.read(designFile);
					
					Map<String,JSONObject> typeDefs = DesignerElParser.parseEl(doc.getRootElement().elements("type"));
					for(String typeName:typeDefs.keySet()){
						typeMap.put(typeName, typeDefs.get(typeName));
					}
					
					Map<String,JSONObject> cmpDefs = DesignerElParser.parseEl(doc.getRootElement().elements("component"));
					for(String cmpName:cmpDefs.keySet()){
						cmpMap.put(cmpName, cmpDefs.get(cmpName));
					}
				}
			}
			
			msg = new JSONMessageResult();
			msg.put("types", typeMap);
			msg.put("components", cmpMap);
		} catch (Exception e) {
			e.printStackTrace();
			msg = new JSONMessageResult("Exception："+e.getMessage());
		}finally{
			if(output!=null){
				try {
					output.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return msg;
	}

}
