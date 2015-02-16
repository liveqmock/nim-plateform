package com.poweruniverse.nim.plateform.webservice;

import java.io.File;

import javax.annotation.Resource;
import javax.jws.WebParam;
import javax.jws.WebService;
import javax.xml.ws.WebServiceContext;

import org.apache.commons.io.FileUtils;

import com.poweruniverse.nim.base.bean.UserInfo;
import com.poweruniverse.nim.base.message.StringResult;
import com.poweruniverse.nim.base.webservice.BasePlateformWebservice;

/**
 * 
 * @author Administrator
 *
 */
@WebService
public class PluginWebserviceImpl extends BasePlateformWebservice{
	
	@Resource
	private WebServiceContext wsContext;
	
	public PluginWebserviceImpl(UserInfo userInfo) {
		super();
		this.userInfo = userInfo;
	}

	/**
	 * 读取resource目录中的内容 （经过freemarker处理）
	 * @param xiTongDH
	 * @param fileName
	 * @param params
	 * @return
	 */
	
	public StringResult html(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		StringResult msg = null;
		try {
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD >=0 || !pageUrl.endsWith("html")){
				msg = new StringResult("html文件"+pageUrl+"不存在！");
			}else{
				File cfgFile = new File(contextPath+"resources/"+pageUrl);
				String fileContent = FileUtils.readFileToString(cfgFile,"utf-8");
				msg = new StringResult(fileContent);
			}
		}catch (Exception e) {
			e.printStackTrace();
			msg = new StringResult(e.getMessage());
		}
		return msg;
	}
		
	/**
	 * 读取resource目录下的页面css文件 
	 * @return
	 */
	public StringResult css(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		StringResult msg = null;
		try {
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD>=0 || !pageUrl.endsWith("css")){
				msg = new StringResult("");
				System.err.println("css文件"+pageUrl+"不存在！");
			}else{
				File cfgFile = new File(contextPath+"resources/"+pageUrl);
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
	 * 读取resource目录下的页面js文件 
	 * @return
	 */
	public StringResult js(
			@WebParam(name="contextPath") String contextPath,
			@WebParam(name="pageUrl") String pageUrl){
		StringResult msg = null;
		try {
			//检查pageUrl 是否合法(无.. js后缀)
			int hasDD = pageUrl.indexOf("..");
			if(hasDD>=0 || !pageUrl.endsWith("js")){
				msg = new StringResult("alert('错误的js文件地址:"+pageUrl+"');");
			}else{
				File cfgFile = new File(contextPath+"resources/"+pageUrl);
				if(cfgFile.exists()){
					String fileContent = FileUtils.readFileToString(cfgFile,"utf-8");
					msg = new StringResult(fileContent);
				}else{
					msg = new StringResult("alert('js文件"+pageUrl+"不存在！');");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			msg = new StringResult("alert('"+e.getMessage()+");");
		}
		return msg;
	}


}
