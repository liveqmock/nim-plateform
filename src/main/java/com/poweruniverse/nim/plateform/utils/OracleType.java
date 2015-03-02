package com.poweruniverse.nim.plateform.utils;

import org.hibernate.criterion.Restrictions;

import com.poweruniverse.nim.data.entity.ZiDuanLX;
import com.poweruniverse.nim.data.service.utils.HibernateSessionFactory;

public class OracleType {

	public static String getColumnSyntax(String type,int width,int dec){
		String syntax = type;
		if(hasWidth(type) || hasDec(type)){
			syntax+="("+(width==0?1:width)+ ((hasDec(type) && dec!=0)?(","+dec):"")+")";
		}
		return syntax;
	}
	
	public static ZiDuanLX getZiDuanLX(String type,int width,int dec){
		String zddh = null;
		if("NUMBER".equalsIgnoreCase(type)){
			if(width==1 && dec == 0){
				zddh = "boolean";
			}else if(dec > 0){
				zddh = "double";
			}else{
				zddh = "int";
			}
		}else if("DATE".equalsIgnoreCase(type)){
			zddh = "date";
		}else if("VARCHAR2".equalsIgnoreCase(type)){
			zddh = "string";
		}else if("CLOB".equalsIgnoreCase(type)){
			zddh = "text";
		}else{
			zddh = "string";
		}
		ZiDuanLX zdlx = (ZiDuanLX)HibernateSessionFactory.getSession(HibernateSessionFactory.defaultSessionFactory).createCriteria(ZiDuanLX.class).add(Restrictions.eq("ziDuanLXDH", zddh)).uniqueResult();
		return zdlx;
	}
	
	public static boolean hasWidth(String type){
		return ("NUMBER".equalsIgnoreCase(type) || "VARCHAR2".equalsIgnoreCase(type));
	}
	
	public static boolean hasDec(String type){
		return "NUMBER".equalsIgnoreCase(type);
	}
}
