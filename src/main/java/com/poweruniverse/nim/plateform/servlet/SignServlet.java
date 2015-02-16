package com.poweruniverse.nim.plateform.servlet;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.Random;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import com.poweruniverse.nim.base.bean.Environment;
import com.poweruniverse.nim.base.bean.UserInfo;
import com.poweruniverse.nim.base.message.InvokeEnvelope;
import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.message.Result;
import com.poweruniverse.nim.base.servlet.BasePlateformServlet;
import com.poweruniverse.nim.base.utils.InvokeUtils;
import com.poweruniverse.nim.base.utils.MD5Utils;

/**
 * 与登录有关的动作
 * 1、显示登录校验码
 * 2、检查登录校验码
 * 3、登录
 * 4、退出登录
 * @author Administrator
 *
 */
public class SignServlet extends BasePlateformServlet{
	private static final long serialVersionUID = 1L;
	public static final Random random= new Random();
	public static final String LOGIN_VALID_CODE= "loginValidCode";

	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		doPost(req, res);
	}
		
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		try {
			
//			String targetCmpName = req.getParameter("component");
//			String targetWsName = req.getParameter("service");
			String targetMtdName = req.getParameter("method");
			if("validCodeImg".equals(targetMtdName)){
				//下载/显示验证码
				//在内存中创建图象
				int iWidth=60,iHeight=18;
				BufferedImage image=new BufferedImage(iWidth,iHeight,BufferedImage.TYPE_INT_RGB);
				//获取图形上下文
				Graphics g=image.getGraphics();
				//设定背景色
				g.setColor(Color.white);
				g.fillRect(0,0,iWidth,iHeight);
				//画边框
				g.setColor(Color.getHSBColor(231,.1f,.78f));
				g.drawRect(0,0,iWidth-1,iHeight-1);
				//
				char charTable[]={
					'A','B','C','D','E','F',
					'G','H','K','M','N','P',
					'R','S','T','W','X','Y',
					'Z'};
			
				//取随机产生的认证码(4位数字)
				int rand1=random.nextInt(charTable.length);
				int rand2=random.nextInt(charTable.length);
				int rand3=random.nextInt(charTable.length);
				int rand4=random.nextInt(charTable.length);
				String rand = new StringBuffer()
					.append(charTable[rand1])
					.append(charTable[rand2])
					.append(charTable[rand3])
					.append(charTable[rand4]).toString();
				//将认证码存入SESSION
				req.getSession().setAttribute(LOGIN_VALID_CODE,rand);
				//将认证码显示到图象中
				Color c1 = Color.getHSBColor(random.nextInt(359),(random.nextFloat()/3)+.6f,random.nextFloat()/2);
				g.setColor(c1);
				g.setFont(new Font("Times New Roman",Font.PLAIN,18));
				g.drawChars(charTable, rand1, 1, 4, 15) ;
				
				Color c2 = Color.getHSBColor(random.nextInt(359),(random.nextFloat()/3)+.6f,random.nextFloat()/2);
				g.setColor(c2);
				g.setFont(new Font("Times New Roman",Font.PLAIN,18));
				g.drawChars(charTable, rand2, 1, 18, 15) ;
				
				Color c3 = Color.getHSBColor(random.nextInt(359),(random.nextFloat()/3)+.6f,random.nextFloat()/2);
				g.setColor(c3);
				g.setFont(new Font("Times New Roman",Font.PLAIN,18));
				g.drawChars(charTable, rand3, 1, 32, 15) ;
				
				Color c4 = Color.getHSBColor(random.nextInt(359),(random.nextFloat()/3)+.6f,random.nextFloat()/2);
				g.setColor(c4);
				g.setFont(new Font("Times New Roman",Font.PLAIN,18));
				g.drawChars(charTable, rand4, 1, 44, 15) ;
				//随机产生44个干扰点,使图象中的认证码不易被其它程序探测到
				for(int iIndex=0;iIndex<44;iIndex++){
					int x=random.nextInt(iWidth);
					int y=random.nextInt(iHeight);
					g.drawLine(x,y,x,y);
				}
				//图象生效
				g.dispose();
//				输出图象到页面
				ImageIO.write(image,"JPEG",resp.getOutputStream());
			}else if("checkValidCode".equals(targetMtdName)){
				//检查登录校验码
				Result result = new JSONMessageResult("验证码错误");
				String parameters = req.getParameter("parameters");
				if(parameters!=null){
					String validCode = JSONObject.fromObject(parameters).getString("validCode");
					if(checkValidCode(validCode,req)){
						result = new JSONMessageResult(); 
					}
				}
				resp.setCharacterEncoding("utf-8");         
				resp.setContentType("text/html; charset=utf-8"); 
				resp.getWriter().write(result.toString());
			}else if("login".equals(targetMtdName)){
				//检查登录
				String arguments = req.getParameter("arguments");
				Result result = null;
				JSONObject argumentsJsonObj = null;
				
				String ip = getServletClientIp(req);
				if(arguments!=null ){
					argumentsJsonObj = JSONObject.fromObject(arguments);
					//
					if(argumentsJsonObj.has("validCode")){
						String validCode = argumentsJsonObj.getString("validCode");
						if(!checkValidCode(validCode,req)){
							resp.setCharacterEncoding("utf-8");         
							resp.setContentType("text/html; charset=utf-8"); 
							resp.getWriter().write(new JSONMessageResult("验证码错误").toString());
						}
					}
					argumentsJsonObj.put("clientIP", ip);
					InvokeEnvelope invokeEnvelope = new InvokeEnvelope("nim-plateform", null, "nim-data", "verify", "userAuth", argumentsJsonObj);
					result = InvokeUtils.invokeService(invokeEnvelope);
				}else{
					result = new JSONMessageResult("未提供登录信息");
				}
				//登录成功 需要在
				if(result.isSuccess()){
					JSONMessageResult jRet = (JSONMessageResult)result;
					//从返回信息中 取得当前登录成功用户的信息
					UserInfo loginUser = new UserInfo((Integer)jRet.get("yongHuDM"), (String)jRet.get("yongHuMC"), (String)jRet.get("dengLuDH"), (String)jRet.get("dengLuMM"), ip);
					//记录当前登录用户
					Environment env = (Environment)req.getSession().getAttribute(Environment.ENV);
					if(env==null){
						env = new Environment(loginUser);
						req.getSession().setMaxInactiveInterval(3600); 
						req.getSession().setAttribute(Environment.ENV,env);
					}else{
						env.userLogin(loginUser);
					}
					
					//是否需要保存cookie
					boolean saveCookie = argumentsJsonObj.getBoolean("saveCookie");
					
					Cookie cookie1 = new Cookie("dengLuDH",URLEncoder.encode(loginUser.getDengLuDH(),"utf-8"));
		    		cookie1.setPath("/");
		        	Cookie cookie2 = new Cookie("dengLuMM",URLEncoder.encode(MD5Utils.MD5(loginUser.getDengLuMM()),"utf-8"));
		    		cookie2.setPath("/");
		    		if(!saveCookie){
		    			cookie1.setMaxAge(0);
		    			cookie2.setMaxAge(0);
		    		}else{
		    			cookie1.setMaxAge(60*60*24*30);
		    			cookie2.setMaxAge(60*60*24*30);
		    		}
		    		resp.addCookie(cookie1);
		    		resp.addCookie(cookie2);
				}
				resp.setCharacterEncoding("utf-8");         
				resp.setContentType("text/html; charset=utf-8"); 
				resp.getWriter().write(result.toString());
			}else if("logout".equals(targetMtdName)){
				//检查登录校验码
				Environment env = (Environment)req.getSession().getAttribute(Environment.ENV);
				if(env!=null && env.getLoginUser()!=null){
					//清除登陆信息
					env.userLogout();
					//清除cookie
			        Cookie cookie = new Cookie("dengLuDH", null);
			        cookie.setPath("/");
			        cookie.setMaxAge(0); // Delete
			        resp.addCookie(cookie);

			        cookie = new Cookie("dengLuMM", null);
			        cookie.setPath("/");
			        cookie.setMaxAge(0); // Delete
			        resp.addCookie(cookie);
			        
					req.getSession().invalidate();
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	private boolean checkValidCode(String validCode,HttpServletRequest req){
		boolean isValid = false;
		String sValidCode = (String)req.getSession().getAttribute(LOGIN_VALID_CODE);
		if(sValidCode!=null && sValidCode.equalsIgnoreCase(validCode)){
			isValid = true;
		}
		return isValid;
	}
}
