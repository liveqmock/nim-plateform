package com.poweruniverse.nim.plateform.webservice;

import java.io.File;

import javax.annotation.Resource;
import javax.jws.WebParam;
import javax.jws.WebService;
import javax.xml.ws.WebServiceContext;

import net.sf.json.JSONObject;

import org.apache.commons.io.FileUtils;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.hibernate.Session;

import com.poweruniverse.nim.base.bean.UserInfo;
import com.poweruniverse.nim.base.description.Application;
import com.poweruniverse.nim.base.message.InvokeEnvelope;
import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.message.StringResult;
import com.poweruniverse.nim.base.utils.InvokeUtils;
import com.poweruniverse.nim.base.webservice.BasePlateformWebservice;
import com.poweruniverse.nim.data.entity.YongHu;
import com.poweruniverse.nim.data.service.utils.HibernateSessionFactory;

/**
 * 
 * @author Administrator
 *
 */
@WebService
public class PageWebserviceImpl extends BasePlateformWebservice{
	
	@Resource
	private WebServiceContext wsContext;
	
	public PageWebserviceImpl(UserInfo userInfo) {
		super();
		this.userInfo = userInfo;
	}

	/**
	 * 读取原始页面内容 
	 * @param contextPath
	 * @param pageUrl
	 * @return
	 */
	public JSONMessageResult orginal(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		String fileContent = null;
		try {
			Application app = Application.getInstance();
			File tempFile = new File(contextPath+app.getModulePath()+"/"+pageUrl);
			if(tempFile.exists()){
				fileContent = FileUtils.readFileToString(tempFile,"utf-8");
			}else{
				fileContent = "文件("+pageUrl+")不存在！";
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		//可能存在的 根据配置文件 生成的脚本
		return new JSONMessageResult("content", fileContent);
	}
	
	/**
	 * 读取页面内容 （经过freemarker处理）
	 * 结果包括两个部分的内容：html、json
	 * @param xiTongDH
	 * @param fileName
	 * @param params
	 * @return
	 */
	public StringResult analyse(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageName") String pageName,
			@WebParam(name="pageUrl") String pageUrl,
			@WebParam(name="isIndependent") boolean isIndependent,
			@WebParam(name="params") String params){
		StringResult msg = null;
		Session sess = null;
		try {
			Application app = Application.getInstance();
			
			sess = HibernateSessionFactory.getSession(HibernateSessionFactory.defaultSessionFactory);
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD ==-1 && pageUrl.endsWith("xml")){
				//调用data组件的webservice方法 完成解析
				UserInfo user = null;
				Integer yongHuDM = this.getYongHuDM(wsContext, false);
				if(yongHuDM!=null){
					YongHu yh = (YongHu)sess.load(YongHu.class,yongHuDM);
					user = new UserInfo(yh.getYongHuDM(),yh.getYongHuMC(),yh.getDengLuDH(),yh.getDengLuMM(),this.getClientIP(wsContext));
				}
				
				JSONObject argument = new JSONObject();
				
				//读取页面xml文件定义
				String pageContent = null;
				File cfgFile = new File(contextPath+app.getModulePath()+"/"+pageUrl.substring(0,pageUrl.indexOf("."))+".xml");
				if(cfgFile.exists()){
					pageContent = FileUtils.readFileToString(cfgFile, "utf-8");
				}
				argument.put("pageContent", pageContent);//xml文件字符串
				argument.put("pageName", pageName);//page文件名
				argument.put("pageUrl", pageUrl);//xml文件字符串
				argument.put("isIndependent", isIndependent);//是否独立打开 （主要用于确定是否独立打开子页面）
				argument.put("params", params);//url传递来的参数
				
				InvokeEnvelope invokeEnvelope = new InvokeEnvelope("nim-plateform", user, "nim-data", "analyse", "analyse", argument);
				msg = (StringResult)InvokeUtils.invokeService(invokeEnvelope);
				
			}else{
				msg = new StringResult("alert('错误的页面地址:"+pageUrl+"');");
			}
		}catch (Exception e) {
			e.printStackTrace();
			msg = new StringResult("alert('"+e.getMessage()+"');");
		}
		return msg;
	}
	
	public JSONMessageResult html(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		JSONMessageResult msg = null;
		try {
			Application app = Application.getInstance();
			
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD ==-1 && pageUrl.endsWith("html")){
				msg = new JSONMessageResult();

				Integer yongHuDM = this.getYongHuDM(wsContext, false);
				msg.put("isLogged", !(yongHuDM==null));

				//读取页面html文件定义
				String htmlContent = null;
				File htmlFile = new File(contextPath+app.getModulePath()+"/"+pageUrl);
				if(htmlFile.exists()){
					htmlContent = FileUtils.readFileToString(htmlFile, "utf-8");
				}else{
					htmlContent = "文件("+pageUrl+")不存在！";
				}
				msg.put("content", htmlContent);
				
				//检查css文件是否存在
				File cssFile = new File(contextPath+app.getModulePath()+"/"+pageUrl.substring(0,pageUrl.lastIndexOf("."))+".css");
				if(cssFile.exists()){
					msg.put("cssExists", true);
				}else{
					msg.put("cssExists", false);
				}
				
				//检查js文件是否存在
				File jsFile = new File(contextPath+app.getModulePath()+"/"+pageUrl.substring(0,pageUrl.lastIndexOf("."))+".js");
				if(jsFile.exists()){
					msg.put("jsExists", true);
				}else{
					msg.put("jsExists", false);
				}
				
				//取得xml文件中的title name width height定义（ 如果是page name = pageUrl)
				File xmlFile = new File(contextPath+app.getModulePath()+"/"+pageUrl.substring(0,pageUrl.lastIndexOf("."))+".xml");
				JSONObject pageObj = new JSONObject();
				if(xmlFile.exists()){
					SAXReader reader = new SAXReader();
					reader.setEncoding("utf-8");
					Document doc = reader.read(xmlFile);
					Element pageEl = doc.getRootElement();
					
					String pageTitle = pageEl.attributeValue("title");
					String pageName = pageEl.attributeValue("name");
					//独立页面被作为子页面加载时 需要用url生成一个name
					if(pageName==null){
						pageName = (pageUrl.substring(0,pageUrl.lastIndexOf("."))+".xml").replaceAll("/", "_").replaceAll("\\.", "_").replaceAll("-", "_");
					}
					String needsLogin = pageEl.attributeValue("needsLogin");
					String pageWidth = pageEl.attributeValue("width");
					String pageHeight = pageEl.attributeValue("height");
					
					pageObj.put("title", pageTitle);
					pageObj.put("name", pageName);
					pageObj.put("needsLogin", "true".equalsIgnoreCase(needsLogin));
					pageObj.put("width", pageWidth);
					pageObj.put("height", pageHeight);
					
					msg.put("xmlExists", true);
				}else{
					msg.put("xmlExists", false);
				}
				msg.put("currentPage", pageObj);
				msg.put("loginPage", app.getLoginPage());
				msg.put("homePage", app.getHomePage());
				
			}else{
				msg = new JSONMessageResult("错误的html页面地址");
			}
		}catch (Exception e) {
			e.printStackTrace();
			msg = new JSONMessageResult(e.getMessage());
		}
		return msg;
	}
		
	/**
	 * 读取module目录下的页面css文件 
	 * @return
	 */
	public StringResult css(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		StringResult msg = null;
		try {
			Application app = Application.getInstance();
			
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD>=0 || !pageUrl.endsWith("css")){
				msg = new StringResult("");
				System.err.println("css文件"+pageUrl+"不存在！");
			}else{
				File cfgFile = new File(contextPath+app.getModulePath()+"/"+pageUrl);
				String fileContent = FileUtils.readFileToString(cfgFile,"utf-8");
				msg = new StringResult(fileContent);
			}
		} catch (Exception e) {
			e.printStackTrace();
			msg = new StringResult("");
		}
		return msg;
	}

	/**
	 * 读取module目录下的页面js文件 
	 * @return
	 */
	public StringResult js(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		StringResult msg = null;
		try {
			Application app = Application.getInstance();
			
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD>=0 || !pageUrl.endsWith("js")){
				msg = new StringResult("alert('错误的js文件地址:"+pageUrl+"');");
			}else{
				File cfgFile = new File(contextPath+app.getModulePath()+"/"+pageUrl);
				if(cfgFile.exists()){
					String fileContent = FileUtils.readFileToString(cfgFile,"utf-8");
					msg = new StringResult(fileContent);
				}else{
					msg = new StringResult("alert('js文件不存在:"+pageUrl+"');");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			msg = new StringResult("alert('"+e.getMessage()+");");
		}
		return msg;
	}

	/**
	 * 读取module目录下的页面xml文件 
	 * @return
	 */
	public StringResult xml(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		StringResult msg = null;
		try {
			Application app = Application.getInstance();
			
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD>=0 || !pageUrl.endsWith("xml")){
				msg = new StringResult("");
				System.err.println("xml文件"+pageUrl+"不存在！");
			}else{
				File cfgFile = new File(contextPath+app.getModulePath()+"/"+pageUrl);
				String fileContent = FileUtils.readFileToString(cfgFile,"utf-8");
				msg = new StringResult(fileContent);
			}
		} catch (Exception e) {
			e.printStackTrace();
			msg = new StringResult("");
		}
		return msg;
	}
}
