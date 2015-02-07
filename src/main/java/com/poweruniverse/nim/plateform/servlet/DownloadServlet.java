package com.poweruniverse.nim.plateform.servlet;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Random;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.Session;

import com.poweruniverse.nim.base.servlet.BasePlateformServlet;

/**
 * 为客户端通过下载功能
 * 1、不需要登录 下载web-inf目录以外 本程序目录下的所有文件
 * 2、为登录用户 根据权限从文档服务器下载附件 
 */

public class DownloadServlet extends BasePlateformServlet {
	private static final long serialVersionUID = 6148303233836485629L;
	public static final Random random= new Random();

	public void doGet(HttpServletRequest req, HttpServletResponse res)
  		throws ServletException, IOException {
		doPost(req, res);
	}
	
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		//下载
		String reqType = req.getParameter("type");
		if("document".equals(reqType)){
			//下载程序目录下非web-inf目录中的任意文件 不需要登录
			FileInputStream fis = null;
			try {
				String fileName= req.getParameter("fileName");
				if(fileName == null){
					//错误 必须提供文件名
				}else if(fileName.toUpperCase().contains("WEB-INF")){
					//错误 不允许访问WEB-INF目录下的内容
				}
				fileName = new String(fileName.getBytes("iso8859-1"),"utf-8");
				//设置response
				res.setContentType("application/octet-stream");
				res.setHeader("Content-Disposition","attachment;filename="+new String(fileName.getBytes("utf-8"),"iso8859-1"));
				File f = new File(ContextPath+fileName);
				if(f.exists()){
					fis = new FileInputStream(f);
					byte[] data = new byte[10240];
					//
					int ret = fis.read(data);
					while(ret!=-1){
						res.getOutputStream().write(data, 0, ret);
						ret = fis.read(data);
					}
					//流
					res.getOutputStream().flush();
					fis.close();
					fis=null;
				}
			} catch (Exception e) {
				e.printStackTrace();
			}finally{
				try {
					if(fis != null) fis.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}else if("file".equals(reqType)){
			//下载附件  需要登陆 
			//根据用户权限 从文档服务器下载
			String fjid = req.getParameter("fjid");
			
			String userIdentifier = null;
			String passwordIdentifier = null;
			String key = null;
			if(userIdentifier!=null){
				BufferedInputStream bis = null;
				Session sess = null;
				try {
					
					//从文档服务器读取文件
//						String documentServerIp = XiTongCsUtils.getDocumentServerIP();
//						String documentServerWebsevicePort = XiTongCsUtils.getDocumentServerWebServicePort();
//						DocumentServiceService documentServiceService = new DocumentServiceService(
//								new URL(DocumentServiceService.class.getResource("."), "http://"+documentServerIp+":"+documentServerWebsevicePort+"/ws/document?wsdl"), 
//								new QName("http://webservice.odm.poweruniverse.com/", "DocumentServiceService")
//						);
//						DocumentService documentWSPort = documentServiceService.getDocumentServicePort();
//						DataHandler fileHandler = documentWSPort.download("file"+fuJian.getFuJianDM(),fuJian.getWenJianHZ());
//					    bis = new BufferedInputStream(fileHandler.getInputStream());
				    
					//从应用服务器路径中读取文件
						
					byte[] data = new byte[10240];
					//设置response
					res.setContentType("application/octet-stream");
					res.setHeader("Content-Disposition","attachment;filename="+new String("".getBytes("gb2312"),"iso8859-1"));
					//
					int ret = bis.read(data);
					while(ret!=-1){
						res.getOutputStream().write(data, 0, ret);
						ret = bis.read(data);
					}
					//流
					res.getOutputStream().flush();
					bis.close();
					bis=null;
					//提交 并关闭session
					sess = null;
				} catch (Exception e) {
					e.printStackTrace();
				}finally{
					try {
						if(bis != null) bis.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
			}else{
//					System.out.println("请重新登录!");
			}
		}
	}
	
}