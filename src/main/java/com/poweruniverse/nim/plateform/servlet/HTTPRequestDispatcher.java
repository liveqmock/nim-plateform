package com.poweruniverse.nim.plateform.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;

import com.poweruniverse.nim.base.bean.Environment;
import com.poweruniverse.nim.base.bean.UserInfo;
import com.poweruniverse.nim.base.message.InvokeEnvelope;
import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.message.Result;
import com.poweruniverse.nim.base.servlet.BasePlateformServlet;
import com.poweruniverse.nim.base.utils.InvokeUtils;

/**
 * 用于过滤客户端通过servlet方式对webservice的访问请求
 * 将请求转发到适当的服务类中
 * @author Administrator
 *
 */
public class HTTPRequestDispatcher extends BasePlateformServlet{
	private static final long serialVersionUID = 1L;
	private static final String SourceComponentName = "nim-plateform";
	
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		Result ret = dispatch(req, resp);
		if(ret!=null){
			resp.setCharacterEncoding("utf-8");         
			resp.setContentType("text/html; charset=utf-8"); 
			resp.getWriter().write(ret.toString());
		}
	}

	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		Result ret = dispatch(req, resp);
		if(ret!=null){
			resp.setCharacterEncoding("utf-8");         
			resp.setContentType("text/html; charset=utf-8"); 
			resp.getWriter().write(ret.toString());
		}
	}
	
	/**
	 * 用户向servlet发出的请求 转发到正确的webservice服务
	 * @param req
	 * @param resp
	 * @return
	 */
	private Result dispatch(HttpServletRequest req, HttpServletResponse resp){
		Result ret = null;
		try {
			String targetCmpName = req.getParameter("component");
			String targetWsName = req.getParameter("service");
			String targetMtdName = req.getParameter("method");
			
			JSONObject argumentsJsonObj = null;
			String arguments = req.getParameter("arguments");
			if(arguments!=null){
				argumentsJsonObj = JSONObject.fromObject(arguments);
			}else{
				argumentsJsonObj = new JSONObject();
			}
			//补充定义 允许 component/service/method/page 的形式 传递参数
			String reqPathInfo = req.getPathInfo();
			if(reqPathInfo.length()>1 && targetCmpName==null ){
				String[] pathParams = reqPathInfo.split("/");
				targetCmpName = pathParams[1];
				targetWsName = pathParams[2];
				targetMtdName = pathParams[3];
				
				if(pathParams.length >4){
					String[] pathParam2 = new String[pathParams.length -4];
					System.arraycopy(pathParams, 4, pathParam2, 0, pathParams.length -4); 
					String pageUrl = StringUtils.join(pathParam2, "/");
					argumentsJsonObj.put("pageUrl", pageUrl);
				}
				   
			}

			//当前系统的运行目录
			argumentsJsonObj.put("contextPath", this.ContextPath);
			
			UserInfo user = null;
			Environment env = (Environment)req.getSession().getAttribute(Environment.ENV);
			if(env!=null){
				user = env.getAuthUser();
			}
			
			//客户端ip
			String clientIp = getServletClientIp(req);
			InvokeEnvelope invokeEnvelope = new InvokeEnvelope(SourceComponentName, user, targetCmpName, targetWsName, targetMtdName, argumentsJsonObj);
			//先根据ip地址 判断源和目标组件之间 是否允许调用
			if(hasIPPermission(invokeEnvelope)){
				ret = InvokeUtils.invokeService(invokeEnvelope);
			}else{
				ret = new JSONMessageResult("当前用户("+user.getDengLuDH()+")无权限从此ip("+clientIp+")访问组件服务("+targetCmpName+"."+targetWsName+")！");
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			ret = new JSONMessageResult(e.getMessage());
		}
		return ret;
	}
	
	
	

	
//	/**
//	 * 从某一服务组件发起对另一服务组件的调用
//	 * @return
//	 */
//	public static ReturnEnvelope invokeFromService(InvokeEnvelope invokeEnvelope){
//		return null;
//	}

	
	/**
	 * 检查用户是否具有从此ip发出请求的许可
	 * @return
	 */
	public static boolean hasIPPermission(InvokeEnvelope invokeSource){
//		//对象相关 需要授权的操作 检查数据权限
//		JSONObject params = new JSONObject();
//		params.put("xiTongDH", xiTongDH);
//		params.put("gongNengDH", gongNengDH);
//		params.put("caoZuoDH", caoZuoDH);
//		params.put("yongHuDM", yongHuDM);
//		params.put("id", id);
//		//通过权限服务 检查
//		InvokeEnvelope permissionEnvelope = new InvokeEnvelope("nss","security","hasDataPermission",params,null);
//		Message permissionMsg = ServiceRouter.invokeService(permissionEnvelope);
//		if(!permissionMsg.isSuccess()){
//			return permissionMsg;
//		}
		return true;
	}


}
