package com.poweruniverse.nim.plateform.servlet;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.poweruniverse.nim.base.bean.Environment;
import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.servlet.BasePlateformServlet;


/**
 * MultiPartServlet
 * @author lyh
 * @version 2013-4-10
 * @see MultiPartServlet
 * @since
 */
public class UploadServlet extends BasePlateformServlet{
    private static final long serialVersionUID = 1325954832925856683L;
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException{
        doPost(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    	JSONMessageResult result = null;
	    try{
			// 检查登录
			Environment env = getEnvironment(req);
			// SetCharacterEncoding = UTF-8
	        req.setCharacterEncoding("utf-8");
	        
	        String fjlx = req.getParameter("fjlx");
	        
		    // Create a factory for disk-based file items
		    FileItemFactory factory = new DiskFileItemFactory();
		
		    // Create a new file upload handler
		    ServletFileUpload upload = new ServletFileUpload(factory);
	    	FileItem fileItem = null;
	        // Parse the request
	        List<FileItem> items = upload.parseRequest(req);
	
	        // Process the uploaded items
	        Iterator<FileItem> iter = items.iterator();
	
	        // Parameters map
	        Map<String,String> params = new HashMap<String,String>();
	
	        // Do list
	        while (iter.hasNext()){
	            FileItem item = iter.next();
	           
	            // Form Field
	            if (item.isFormField()){
	                // Field name
	                String name = item.getFieldName();
	               
	                // Set charset = UTF-8 Default = ISO-8859-1 
	                // Get field value
	                String value = item.getString("utf-8");
	                
	                // Put into map
	                params.put(name, value.trim());
	            }else if(item.getFieldName().equals("myfile")){
					fileItem = item;
	            }
	        }
	        // Set contentType= html charset=utf-8
//		        resp.setContentType("text/html;charset=utf-8");
	        String fileName = null;
	        if(fjlx.equals("2")){//ie
	        	fileName = fileItem.getName();
	        }else{
	        	fileName = (String)params.get("fileName");
	        }
	        
	        if(fileName==null || fileName.length()==0){
	        	result = new JSONMessageResult("文件名不允许为空");
	        }else if(fileItem.getSize() == 0){
	        	result = new JSONMessageResult("文件长度不允许为0");
	        }else{
//	        	result = doUploadFJ(yh,fileName,fileItem);
	        }
			
	    }catch (Exception e){
	    	e.printStackTrace();
			result = new JSONMessageResult(e.getMessage());
			
		}
		resp.setCharacterEncoding("utf-8");         
		resp.setContentType("text/html; charset=utf-8"); 
		resp.getWriter().write(result.toString());
		resp.flushBuffer();
    }
	
}