package com.poweruniverse.nim.plateform.datasetImpl;

import java.io.File;
import java.io.FileFilter;
import java.util.Arrays;
import java.util.Comparator;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import com.poweruniverse.nim.base.bean.BaseJavaDatasource;
import com.poweruniverse.nim.base.description.Application;

/**
 * 返回module目录下 文件列表
 * @author Administrator
 *
 */
public class ModuleFileDatasource extends BaseJavaDatasource {

	@Override
	public JSONObject getData(JSONArray filters, JSONObject params, int start, int limit) {
		JSONObject jsonData = new JSONObject();
		try {
			Application app = Application.getInstance();
			
			String pathName = null;
			if(filters!=null && filters.size()>0){
				pathName = filters.getJSONObject(0).getString("value");
			}
			
			JSONArray htmlFileArray = new JSONArray();
			if(pathName==null || pathName.length()==0 ){
				JSONObject htmlFileObj = new JSONObject();
				htmlFileObj.put("parent", null);
				htmlFileObj.put("filePath", "/");
				htmlFileObj.put("fileName", "/");
				htmlFileObj.put("isDir", "true");
				htmlFileArray.add(htmlFileObj);
			}else{
				if(!pathName.endsWith("/")){
					pathName = pathName+"/";
				}
				if(pathName.startsWith("/")){
					pathName = pathName.substring(1);
				}
				
				File filePath = new File(app.getContextPath()+app.getModulePath()+"/"+pathName);
				if(filePath.exists()){
					File[] htmlFiles = filePath.listFiles(
						new FileFilter(){
							public boolean accept(File file) {
								return file.getName().endsWith(".html") || file.isDirectory() ;
							}
						}
					);
					Arrays.sort(htmlFiles,new FileComparator());
					for(int i=0;i<htmlFiles.length;i++){
						File htmlFile = htmlFiles[i];
						JSONObject htmlFileObj = new JSONObject();
						htmlFileObj.put("parent", JSONObject.fromObject("{id:'"+(pathName.length()==0?"/":pathName)+"'}"));//上级目录
						htmlFileObj.put("filePath", pathName+htmlFile.getName()+"/");
						htmlFileObj.put("fileName", htmlFile.getName());
						htmlFileObj.put("isDir", htmlFile.isDirectory());
						htmlFileArray.add(htmlFileObj);
					}
				}
			}
			
			jsonData.put("totalCount", htmlFileArray.size());
			jsonData.put("start", start);
			jsonData.put("limit", limit);
			jsonData.put("rows", htmlFileArray);
		} catch (Exception e) {
			e.printStackTrace();
			jsonData.put("totalCount", 0);
			jsonData.put("start", start);
			jsonData.put("limit", limit);
			jsonData.put("rows", new JSONArray());
		}
		return jsonData;
	}
	
	class FileComparator implements Comparator<File> { 
	     public int compare(File one, File another) {
	    	 int i=0;
	         if(one.isDirectory() && !another.isDirectory()) {
	              i = -1;
	         }else if(!one.isDirectory() && another.isDirectory()) {
	              i = 1; 
	         }else  {
	        	  i = one.getName().compareTo(another.getName());
	         }
	         return i;
	     }
	}

}
