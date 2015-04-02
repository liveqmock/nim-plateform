package com.poweruniverse.nim.plateform.webservice;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
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

import com.poweruniverse.nim.base.bean.UserInfo;
import com.poweruniverse.nim.base.description.Application;
import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.message.StringResult;
import com.poweruniverse.nim.base.webservice.AbstractWebservice;
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
public class DesignerWebserviceImpl extends AbstractWebservice{
	@Resource
	private WebServiceContext wsContext;
	
	public DesignerWebserviceImpl(UserInfo userInfo) {
		super();
		this.userInfo = userInfo;
	}

	
	public JSONMessageResult savePageDef(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl,
			@WebParam(name="pageDef") String pageDef){
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
		JSONObject pageDefineJson = JSONObject.fromObject(pageDef);
		XMLWriter output = null;
		try {
			Application app = Application.getInstance();
			
			Document doc = DocumentHelper.createDocument();
			Element cfgEl = doc.addElement("page");
			
			JSONConvertUtils.applyJson2XML(cfgEl,pageDefineJson);
			
			OutputFormat format = OutputFormat.createPrettyPrint(); //设置XML文档输出格式
			format.setEncoding("utf-8"); //设置XML文档的编码类型
			
			output = new XMLWriter(new FileOutputStream(new File(contextPath+app.getModulePath()+"/"+pageUrl)),format);
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
			@WebParam(name="pageUrl") String pageUrl){
		JSONMessageResult msg = null;

		try {
			Application app = Application.getInstance();
			
			JSONObject pageDef = new JSONObject();
			
			File cfgFile = new File(contextPath+app.getModulePath()+"/"+pageUrl);
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
			Application app = Application.getInstance();
			
			String filePathName = pageUrl.replaceAll("\\.\\.", "");
			File cfgFile = new File(contextPath+app.getModulePath()+"/"+filePathName);
			FileUtils.writeStringToFile(cfgFile, content);
			msg = new JSONMessageResult();
		} catch (Exception e) {
			e.printStackTrace();
			msg = new JSONMessageResult("Exception："+e.getMessage());
		}
		return msg;
	}
	
	/**
	 * 读取module目录下的页面html css js xml文件 
	 * @return
	 */
	public StringResult readFile(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		StringResult msg = new StringResult();
		try {
			Application app = Application.getInstance();
			
			String filePathName = pageUrl.replaceAll("\\.\\.", "");
			File cfgFile = new File(contextPath+app.getModulePath()+"/"+filePathName);
			if(cfgFile.exists()){
				String fileContent = FileUtils.readFileToString(cfgFile,"utf-8");
				msg = new StringResult(fileContent);
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		return msg;
	}
	/**
	 * 读取/解析 客户端组件定义文件 
	 * @return
	 */
	public JSONMessageResult readCmpDef(@WebParam(name="contextPath") String contextPath){
		JSONMessageResult msg = null;
	
		XMLWriter output = null;
		try {
			JSONObject typeMap = new JSONObject();
			JSONObject cmpMap = new JSONObject();
			
			SAXReader reader = new SAXReader();
			reader.setEncoding("utf-8");
			
			List<Document> cmpDefDocs = new ArrayList<Document>();
			
			cmpDefDocs.add(reader.read(DesignerWebserviceImpl.class.getResourceAsStream("/com/poweruniverse/nim/plateform/browser/component/component-columns.xml")));
			cmpDefDocs.add(reader.read(DesignerWebserviceImpl.class.getResourceAsStream("/com/poweruniverse/nim/plateform/browser/component/component-fields.xml")));
			cmpDefDocs.add(reader.read(DesignerWebserviceImpl.class.getResourceAsStream("/com/poweruniverse/nim/plateform/browser/component/components.xml")));
			cmpDefDocs.add(reader.read(DesignerWebserviceImpl.class.getResourceAsStream("/com/poweruniverse/nim/plateform/browser/component/type-columns.xml")));
			cmpDefDocs.add(reader.read(DesignerWebserviceImpl.class.getResourceAsStream("/com/poweruniverse/nim/plateform/browser/component/type-fields.xml")));
			cmpDefDocs.add(reader.read(DesignerWebserviceImpl.class.getResourceAsStream("/com/poweruniverse/nim/plateform/browser/component/types.xml")));
			
			//读取type定义
			for(Document doc:cmpDefDocs){

				Map<String,JSONObject> typeDefs = DesignerElParser.parseEl(doc.getRootElement().elements("type"));
				for(String typeName:typeDefs.keySet()){
					typeMap.put(typeName, typeDefs.get(typeName));
				}
				
				Map<String,JSONObject> cmpDefs = DesignerElParser.parseEl(doc.getRootElement().elements("component"));
				for(String cmpName:cmpDefs.keySet()){
					cmpMap.put(cmpName, cmpDefs.get(cmpName));
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
