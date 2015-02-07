package com.poweruniverse.nim.plateform.servlet;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
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

public class GetResourcesServlet extends BasePlateformServlet {
	private static final long serialVersionUID = 6148303233836485629L;
	public static final Random random= new Random();

	
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		//下载
		String uri = req.getPathInfo();
		
		String uri_utf_8 = new String(uri.getBytes("iso8859-1"),"utf-8");
		
		//下载类路径中 com/poweruniverse/nim/plateform/browser/resources/目录中的任意文件 不需要登录
		InputStream fis = null;
		
		try {
			//设置response
			res.setContentType("application/octet-stream");
			res.setHeader("Content-Disposition","attachment;filename="+new String(uri_utf_8.getBytes("utf-8"),"iso8859-1"));

			byte[] data = new byte[10240];
			fis = GetResourcesServlet.class.getResourceAsStream("/com/poweruniverse/nim/plateform/browser/resources"+uri_utf_8);
			if(fis==null){
				System.err.println("资源文件:"+uri_utf_8+"不存在！");
			}else{
				System.out.println("资源文件:"+uri_utf_8+"存在！");
				//
				int ret = fis.read(data);
				while(ret!=-1){
					res.getOutputStream().write(data, 0, ret);
					ret = fis.read(data);
				}
			}
			//流
			res.getOutputStream().flush();
			fis.close();
			fis=null;
		} catch (Exception e) {
			e.printStackTrace();
		}finally{
			try {
				if(fis != null) fis.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	
	}
	
}