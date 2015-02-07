package com.poweruniverse.nim.plateform.webservice;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.jws.WebParam;
import javax.jws.WebService;
import javax.xml.ws.WebServiceContext;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.io.FileUtils;
import org.dom4j.Element;
import org.hibernate.Session;

import com.poweruniverse.nim.base.bean.UserInfo;
import com.poweruniverse.nim.base.message.InvokeEnvelope;
import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.utils.InvokeUtils;
import com.poweruniverse.nim.base.webservice.BasePlateformWebservice;
import com.poweruniverse.nim.data.entity.ShiTiLei;
import com.poweruniverse.nim.data.entity.YongHu;
import com.poweruniverse.nim.data.entity.ZiDuan;
import com.poweruniverse.nim.data.service.utils.SystemSessionFactory;

import freemarker.template.Configuration;
import freemarker.template.Template;

/**
 * 
 * @author Administrator
 *
 */
@WebService
public class PageWebserviceImpl extends BasePlateformWebservice{
	
	@Resource
	private WebServiceContext wsContext;
	/**
	 * 读取原始页面内容 
	 * @param contextPath
	 * @param pageUrl
	 * @return
	 */
	public JSONMessageResult orginal(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		File tempFile = new File(contextPath+"module/"+pageUrl);
		String fileContent = null;
		try {
			fileContent = FileUtils.readFileToString(tempFile,"utf-8");
		} catch (IOException e) {
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
	public JSONMessageResult html(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl,
			@WebParam(name="params") String params){
		JSONMessageResult msg = null;
		Session sess = null;
		try {
			sess = SystemSessionFactory.getSession();
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD ==-1 && (pageUrl.endsWith("html") || pageUrl.endsWith("ftl"))){
				//调用data组件的webservice方法 完成解析
				UserInfo user = null;
				Integer yongHuDM = this.getYongHuDM(wsContext, false);
				if(yongHuDM!=null){
					YongHu yh = (YongHu)sess.load(YongHu.class,yongHuDM);
					user = new UserInfo(yh.getDengLuDH(),yh.getYongHuMC(),yh.getDengLuMM());
				}
				
				JSONObject argument = new JSONObject();
				
				//读取页面xml文件定义
				String cfgContent = null;
				File cfgFile = new File(contextPath+"module/"+pageUrl.substring(0,pageUrl.indexOf("."))+".xml");
				if(cfgFile.exists()){
					cfgContent = FileUtils.readFileToString(cfgFile, "utf-8");
				}
				argument.put("cfgContent", cfgContent);//xml文件字符串
				
				//读取页面xml文件定义
				String htmlContent = null;
				File htmlFile = new File(contextPath+"module/"+pageUrl.substring(0,pageUrl.indexOf("."))+".xml");
				if(htmlFile.exists()){
					htmlContent = FileUtils.readFileToString(htmlFile, "utf-8");
				}
				argument.put("htmlContent", htmlContent);//html文件字符串
				
				argument.put("params", params);//url传递来的参数
				
				InvokeEnvelope invokeEnvelope = new InvokeEnvelope("oim-plateform", user, "oim-data", "page", "analyse", argument);
				msg = (JSONMessageResult)InvokeUtils.invokeService(invokeEnvelope);
			}else{
				msg = new JSONMessageResult("错误的地址");
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
	public JSONMessageResult css(String contextPath, String pageUrl){
		JSONMessageResult msg = null;
		try {
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD>=0 || !pageUrl.endsWith("css")){
				msg = new JSONMessageResult("错误的地址");
			}else{
				File cfgFile = new File(contextPath+"module/"+pageUrl);
				String fileContent = FileUtils.readFileToString(cfgFile,"utf-8");
				msg = new JSONMessageResult("content", fileContent);
			}
		} catch (Exception e) {
			e.printStackTrace();
			msg = new JSONMessageResult(e.getMessage());
		}
		return msg;
	}

	/**
	 * 读取module目录下的页面js文件 
	 * @return
	 */
	public JSONMessageResult js(String contextPath, String jsFileUrl){
		JSONMessageResult msg = null;
		try {
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = jsFileUrl.indexOf("..");
			if(hasDD>=0 || !jsFileUrl.endsWith("js")){
				msg = new JSONMessageResult("错误的地址");
			}else{
				File cfgFile = new File(contextPath+"module/"+jsFileUrl);
				if(cfgFile.exists()){
					String fileContent = FileUtils.readFileToString(cfgFile,"utf-8");
					
//					fileContent = "try{\n"+fileContent+"}catch(e){\nalert(e.name + ':' + e.message);\n}\n";
					msg = new JSONMessageResult("content", fileContent);
				}else{
					msg = new JSONMessageResult("content", "");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			msg = new JSONMessageResult(e.getMessage());
		}
		return msg;
	}


}
