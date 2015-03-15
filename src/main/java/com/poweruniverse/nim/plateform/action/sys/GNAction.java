package com.poweruniverse.nim.plateform.action.sys;




public class GNAction {
//	public MethodResult onModuleGenerate(String gongNengDH, String caoZuoDH,List<EntityI> entities,Map<String,Map<String,List<ModelData>>> postDataMap,YongHu yh,HttpServletRequest request,HttpServletResponse response) throws Exception{
//		MethodResult msg = null;
//		try {
//			doGenerateGn(entities.get(0),yh,false);
//			msg = new MethodResult();
//		} catch (Exception e) {
//			msg = new MethodResult(e.getMessage());
//			e.printStackTrace();
//		}
//		return msg;
//	}
//	
//	//部署工作流
//	public MethodResult onDeploy(String gongNengDH, String caoZuoDH,List<EntityI> entities,Map<String,Map<String,List<ModelData>>> postDataMap,YongHu yh,HttpServletRequest request,HttpServletResponse response) throws Exception{
//		MethodResult msg = null;
//		try {
//			msg = new MethodResult();
//			//
//			GongNeng gn = (GongNeng)entities.get(0);
//			//
//			Session sess = HibernateSessionFactory.getSession();
//			//
//			for(GongNengGZL gzl:gn.getGzls()){
//				msg = TaskUtils.doDeployWorkflow(gzl);
//				if(!msg.isSuccess()){
//					break;
//				}
//			}
//			//生成此功能
//			if(msg.isSuccess()){
//				//设置未启用标志
//				for(GongNengCZ gncz:gn.getCzs()){
//					gncz.setShiFouQY(false);
//				}
//				for(GongNengLC gnlc:gn.getLcs()){
//					gnlc.setShiFouQY(false);
//				}
//				sess.update(gn);
//				//
//				doGenerateGn(gn,yh,false);
//			}
//			
//		} catch (Exception e) {
//			msg = new MethodResult(e.getMessage());
//			e.printStackTrace();
//		}
//		return msg;
//	}
//	
//	
//	public MethodResult onActionGenerate(String gongNengDH,String caoZuoDH,List<EntityI> entities,Map<String,Map<String,List<ModelData>>> postDataMap,YongHu yh,HttpServletRequest request,HttpServletResponse response) throws Exception{
//		MethodResult msg = null;
//		try {
//			GongNeng gn = (GongNeng)entities.get(0);
//			//检查是否为功能设定了功能类别、所属系统 
//			//以及对应的功能类别和所属系统是否设置了代号
//			if(gn.getGongNengLB()==null){
//				msg = new MethodResult("功能'"+gn.getGongNengMC()+"'未设置功能类别！");
//				return msg;
//			}else if (gn.getGongNengLB().getGongNengLBDH()==null){
//				msg = new MethodResult("功能'"+gn.getGongNengMC()+"'的所属类别'"+gn.getGongNengLB().getGongNengLBMC()+"'未设置功能类别代号！");
//				return msg;
//			}
//			if(gn.getXiTong()==null){
//				msg = new MethodResult("功能'"+gn.getGongNengMC()+"'未设置所属系统！");
//				return msg;
//			}else if (gn.getXiTong().getXiTongDH()==null){
//				msg = new MethodResult("功能'"+gn.getGongNengMC()+"'的所属系统'"+gn.getXiTong().getXiTongMC()+"'未设置系统代号！");
//				return msg;
//			}
//			BufferedWriter out = null;
//			//根据实体类className 获取action 包名
//			String packageName = "";
//			String packagePath = "";
//			String entityClassName = gn.getShiTiLei().getShiTiLeiClassName();
//			String entityPrefix = "com.poweruniverse.oim.server.entity.";
//			if(entityClassName.startsWith(entityPrefix)){
//				packageName = entityClassName.substring(entityPrefix.length(), entityClassName.length());
//				//去除最后的类名
//				packageName= packageName.substring(0, packageName.lastIndexOf("."));
//			}else{
//				packageName = "other";
//			}
//			packagePath = packageName.replaceAll("\\.", "/");
//			//打开列表模版 
//			Configuration freemarkerCfg = new Configuration();
//			freemarkerCfg.setDirectoryForTemplateLoading(new File(BaseService.contextPath+XiTongCsUtils.getTemplateFilePath()));
//			//action模版 
//			Template actionTemplate = freemarkerCfg.getTemplate("action.ftl");
//			actionTemplate.setEncoding("UTF-8");
//			//修改功能实现类
//			gn.setGongNengClass(XiTongCsUtils.getActionClassPackage()+"."+packageName+"."+gn.getGongNengDH().toUpperCase()+"Action");
//			//处理数据
//			HashMap<String,Object> root = new HashMap<String,Object>();
//			root.put("gn", gn); 
//			root.put("package", packageName); 
//			
//			//打开action模版 生成action java文件
//			File actionFile = new File(XiTongCsUtils.getSrcFilePath()+XiTongCsUtils.getActionClassPath()+packagePath+"/"+gn.getGongNengDH().toUpperCase()+"Action.java");
//			if(!actionFile.exists()){
//				new File(XiTongCsUtils.getSrcFilePath()+XiTongCsUtils.getActionClassPath()+packagePath).mkdirs();
//			}
//			if(!actionFile.exists()){
//				//为当前功能操作生成编辑文件
//				out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(actionFile),"UTF-8"));
//				actionTemplate.process(root,out);
//				out.flush();
//				out.close();
//				out = null;
//			}
//			msg = new MethodResult();
//		} catch (Exception e) {
//			msg = new MethodResult(e.getMessage());
//			e.printStackTrace();
//		}
//		return msg;
//	}
//	
//	public MethodResult onAnalysisCZBL(String gongNengDH,String caoZuoDH,List<EntityI> entities,Map<String,Map<String,List<ModelData>>> postDataMap,YongHu yh,HttpServletRequest request,HttpServletResponse response) throws Exception{
//		MethodResult msg = null;
//		try {
//			Session sess = HibernateSessionFactory.getSession();
//			GongNeng gn = (GongNeng)entities.get(0);
//			//对功能操作循环
//			for(GongNengCZ gncz:gn.getCzs()){
//				//form类型的操作 
//				if("FORM".equalsIgnoreCase(gncz.getCaoZuoLB().getCaoZuoLBMC())){
//					//清除bl定义
//					while(gncz.getCzbls().size()>0){
//						GongNengCZBL czbl = gncz.getCzbls().iterator().next();
//						czbl.setGongNengCZ(null);
//						gncz.getCzbls().remove(czbl);
//					}
//					//
//					Set<ZiDuan> zds = new HashSet<ZiDuan>();
//					//对操作模板循环
//					for(CaoZuoMB czmb:gncz.getCzmbs()){
//						//分析form类型的操作模板
//						if("form".equalsIgnoreCase(czmb.getMoBanLB().getMoBanLBDH())){
//							zds.addAll(doAnalysisCZMB(czmb,request.getServletContext().getRealPath("/")));
//						}
//					}
//					//增加bl定义
//					Iterator<ZiDuan> zdIterator = zds.iterator();
//					while(zdIterator.hasNext()){
//						ZiDuan zd = zdIterator.next();
//						GongNengCZBL czbl = new GongNengCZBL();
//						czbl.setZiDuan(zd);
//						czbl.setShiFouJJLBH(false);
//						gncz.addToczbls(gncz, czbl);
//					}
//					sess.update(gncz);
//				}
//			}
//			msg = new MethodResult();
//		} catch (Exception e) {
//			msg = new MethodResult(e.getMessage());
//			e.printStackTrace();
//		}
//		return msg;
//	}
//	
//	//从操作模板中取得字段定义
//	private List<ZiDuan> doAnalysisCZMB(CaoZuoMB czmb,String contextPath){
//		List<ZiDuan> zds = new ArrayList<ZiDuan>();
// 		try {
//			String formCfgFileName = czmb.getCaoZuoMBLJ()+czmb.getGongNengCZ().getGongNeng().getGongNengDH()+czmb.getfirstUpCaoZuoDH()+".def.xml";
//				
//			//读取模块定义文件 获取form的列定义
//			SAXReader reader = new SAXReader();
//			reader.setEncoding("utf-8");
//			Document doc = reader.read(new File(contextPath+XiTongCsUtils.getModelFilePath()+formCfgFileName));
//			
//			Element moduleEl = doc.getRootElement();//module
//			
//			//取得当前数据对应实体类类型
//			GongNeng gn = GongNeng.getGongNengByDH(czmb.getGongNengCZ().getGongNeng().getGongNengDH());
//			ShiTiLei stl = gn.getShiTiLei();
//			
//			//取得form的定义
//			Element formEl = moduleEl.element("form");//form
//			if(formEl!=null){
//				//将所有未定义在fieldSet的field 
//				if(formEl.elements("field").size()>0){
//					Iterator<Element> fieldEls = formEl.elements("field").iterator();
//					while(fieldEls.hasNext()){
//						Element fieldEl1 = fieldEls.next();
//						//读取field配置
//						String code = fieldEl1.attributeValue("code");
//						String enabledString = fieldEl1.attributeValue("enabled");
//						if(code.indexOf(".")==-1 && !enabledString.equalsIgnoreCase("false") && stl.hasZiDuan(code)){
//							zds.add(stl.getZiDuan(code)); 
//						}
//					}
//				}
//				//取得fieldSet配置
//				for(Object fieldSetElObj:formEl.elements("fieldSet")){
//					Element fieldSetEl = (Element)fieldSetElObj;
//					Iterator<Element> fieldEls = fieldSetEl.elements("field").iterator();
//					while(fieldEls.hasNext()){
//						Element fieldEl1 = fieldEls.next();
//						//读取field配置
//						String code = fieldEl1.attributeValue("code");
//						String enabledString = fieldEl1.attributeValue("enabled");
//						if(code!=null && code.indexOf(".")==-1 && (enabledString==null || !enabledString.equalsIgnoreCase("false")) && stl.hasZiDuan(code)){
//							zds.add(stl.getZiDuan(code)); 
//						}
//					}
//				}
//			}
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return zds;
//	}
//	
//	//新增流程功能的时候 自动添加：填写、查看、删除、列表等操作
//	//新增普通功能的时候 自动添加：新增、编辑、查看、删除、列表等操作
//	public Object getFormObject(String caoZuoDH,Integer id,Integer yongHuDM,Object dataObj,GongNengCZ originalGNCZ) throws Exception{
//		GongNeng gn = (GongNeng)dataObj;
//		if("appendWorkflow".equals(caoZuoDH)){
//			//自动创建list等操作
//			GongNengCZ gncz = new GongNengCZ(-1);
//			gncz.setCaoZuoDH("list");
//			gncz.setCaoZuoMC("列表");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.Json,"JSON"));//json
//			gncz.setDuiXiangXG(true);
//			gncz.setKeYiSQ(true);
//			gncz.setXianShiLJ(false);
//			gncz.setGongNengCZXH(99);
//			gn.addToczs(gn, gncz);
//			//自动创建delete等操作
//			gncz = new GongNengCZ(-2);
//			gncz.setCaoZuoDH("delete");
//			gncz.setCaoZuoMC("删除");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.Status,"STATUS"));//status
//			gncz.setDuiXiangXG(true);
//			gncz.setKeYiSQ(true);
//			gncz.setXianShiLJ(true);
//			gncz.setGongNengCZXH(4);
//			gn.addToczs(gn, gncz);
//			//自动创建show等操作
//			gncz = new GongNengCZ(-3);
//			gncz.setCaoZuoDH("show");
//			gncz.setCaoZuoMC("查看");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.ProcessFormView,"PROCESSFORMVIEW"));//form
//			gncz.setDuiXiangXG(true);
//			gncz.setKeYiSQ(true);
//			gncz.setXianShiLJ(true);
//			gncz.setGongNengCZXH(3);
//			gn.addToczs(gn, gncz);
//			//自动创建append等操作
//			 gncz = new GongNengCZ(-4);
//			gncz.setCaoZuoDH("append");
//			gncz.setCaoZuoMC("填写单据");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.Form,"FORM"));//form
//			gncz.setDuiXiangXG(false);
//			gncz.setKeYiSQ(true);
//			gncz.setXianShiLJ(true);
//			gncz.setGongNengCZXH(1);
//			gn.addToczs(gn, gncz);
//			
//			gn.setShiFouLCGN(true);
//		}else if("append".equals(caoZuoDH)){
//			//自动创建list等操作
//			GongNengCZ gncz = new GongNengCZ(-1);
//			gncz.setCaoZuoDH("select");
//			gncz.setCaoZuoMC("选择");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.Json,"JSON"));//json
//			gncz.setDuiXiangXG(true);
//			gncz.setKeYiSQ(false);
//			gncz.setXianShiLJ(false);
//			gncz.setGongNengCZXH(99);
//			gn.addToczs(gn, gncz);
//			//自动创建list等操作
//			gncz = new GongNengCZ(-2);
//			gncz.setCaoZuoDH("list");
//			gncz.setCaoZuoMC("列表");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.Json,"JSON"));//json
//			gncz.setDuiXiangXG(true);
//			gncz.setKeYiSQ(true);
//			gncz.setXianShiLJ(false);
//			gncz.setGongNengCZXH(99);
//			gn.addToczs(gn, gncz);
//			//自动创建delete等操作
//			gncz = new GongNengCZ(-3);
//			gncz.setCaoZuoDH("delete");
//			gncz.setCaoZuoMC("删除");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.Status,"STATUS"));//status
//			gncz.setDuiXiangXG(true);
//			gncz.setKeYiSQ(true);
//			gncz.setXianShiLJ(true);
//			gncz.setGongNengCZXH(4);
//			gn.addToczs(gn, gncz);
//			//自动创建show等操作
//			gncz = new GongNengCZ(-4);
//			gncz.setCaoZuoDH("show");
//			gncz.setCaoZuoMC("查看");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.FormView,"FORMVIEW"));//form
//			gncz.setDuiXiangXG(true);
//			gncz.setKeYiSQ(true);
//			gncz.setXianShiLJ(true);
//			gncz.setGongNengCZXH(3);
//			gn.addToczs(gn, gncz);
//			//自动创建edit等操作
//			gncz = new GongNengCZ(-5);
//			gncz.setCaoZuoDH("edit");
//			gncz.setCaoZuoMC("编辑");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.Form,"FORM"));//form
//			gncz.setDuiXiangXG(true);
//			gncz.setKeYiSQ(true);
//			gncz.setXianShiLJ(true);
//			gncz.setGongNengCZXH(2);
//			gn.addToczs(gn, gncz);
//			
//			//自动创建append等操作
//			gncz = new GongNengCZ(-6);
//			gncz.setCaoZuoDH("append");
//			gncz.setCaoZuoMC("新增");
//			gncz.setCaoZuoLB(new CaoZuoLB(CaoZuoLB.Form,"FORM"));//form
//			gncz.setDuiXiangXG(false);
//			gncz.setKeYiSQ(true);
//			gncz.setXianShiLJ(true);
//			gncz.setGongNengCZXH(1);
//			gn.addToczs(gn, gncz);
//			
//			gn.setShiFouLCGN(false);
//		}
//		return gn;
//	}
//
//
//	
//	/**
//	 * 为功能操作 生成操作模板
//	 * @param entity
//	 * @param yh
//	 * @param overwrite
//	 * @throws Exception
//	 */
//	private void doGenerateGn(EntityI entity,YongHu yh,boolean overwrite) throws Exception{
//		Session sess = HibernateSessionFactory.getSession();
//		
//		GongNeng gn = (GongNeng)entity;
//		//检查是否为功能设定了功能类别、所属系统 
//		//以及对应的功能类别和所属系统是否设置了代号
//		if(gn.getGongNengLB()==null){
//			throw new Exception("功能'"+gn.getGongNengMC()+"'未设置功能类别！");
//		}else if (gn.getGongNengLB().getGongNengLBDH()==null){
//			throw new Exception("功能'"+gn.getGongNengMC()+"'的所属类别'"+gn.getGongNengLB().getGongNengLBMC()+"'未设置功能类别代号！");
//		}
//		if(gn.getXiTong()==null){
//			throw new Exception("功能'"+gn.getGongNengMC()+"'未设置所属系统！");
//		}else if (gn.getXiTong().getXiTongDH()==null){
//			throw new Exception("功能'"+gn.getGongNengMC()+"'的所属系统'"+gn.getXiTong().getXiTongMC()+"'未设置系统代号！");
//		}
//		BufferedWriter out = null;
//		
//		//根据实体类className 获取action 包名
//		String packageName = "";
////		String packagePath = "";
//		String entityClassName = gn.getShiTiLei().getShiTiLeiClassName();
//		String entityPrefix = "com.poweruniverse.oim.server.entity.";
//		if(entityClassName.startsWith(entityPrefix)){
//			packageName = entityClassName.substring(entityPrefix.length(), entityClassName.length());
//			//去除最后的类名
//			packageName= packageName.substring(0, packageName.lastIndexOf("."));
//		}else{
//			packageName = "other";
//		}
////		packagePath = packageName.replaceAll("\\.", "/");
//		//打开列表模版 
//		Configuration freemarkerCfg = new Configuration();
//		freemarkerCfg.setDirectoryForTemplateLoading(new File(BaseService.contextPath+XiTongCsUtils.getTemplateFilePath()));
//		//处理数据
//		HashMap<String,Object> root = new HashMap<String,Object>();
//		root.put("gn", gn); 
//		root.put("package", packageName); 
//		root.put("report_server_url", "http://"+XiTongCsUtils.getReportServerIP()+":"+XiTongCsUtils.getReportServerWebPort()+"/orm"); 
//		
//		
//		//根据功能操作定义 检查list以及form操作模版是否存在
//		GongNengCZ listGncz = null;
//		Iterator<GongNengCZ> gnczIts = gn.getCzs().iterator();
//		while(gnczIts.hasNext()){
//			GongNengCZ gncz = gnczIts.next();
//			//检查 是否存在对应的操作模版
//			if(gncz.getCaoZuoLB().getCaoZuoLBMC().equalsIgnoreCase("USERDEFINE") || gncz.getCaoZuoLB().getCaoZuoLBMC().equalsIgnoreCase("FORM") || gncz.getCaoZuoLB().getCaoZuoLBMC().equalsIgnoreCase("FORMVIEW") || gncz.getCaoZuoLB().getCaoZuoLBMC().equalsIgnoreCase("PROCESSFORMVIEW") || gncz.getCaoZuoLB().getCaoZuoLBMC().equalsIgnoreCase("REPORT") || gncz.getCaoZuoDH().equalsIgnoreCase("LIST")){
//				CaoZuoMB caoZuoMB = gncz.getCaoZuoMB();
//				if(caoZuoMB==null){
//					//是否默认操作模版已存在 仅未关联而已
//					caoZuoMB = (CaoZuoMB)sess.createCriteria(CaoZuoMB.class)
//							.add(Restrictions.eq("gongNengCZ.id", gncz.getGongNengCZDM()))
//							.add(Restrictions.eq("caoZuoMBDH", gncz.getCaoZuoDH()))
//							.uniqueResult();
//				}else{
//					//是否关联的操作模版 已不存在
//					caoZuoMB = (CaoZuoMB)sess.createCriteria(CaoZuoMB.class).add(Restrictions.idEq(gncz.getCaoZuoMB().getCaoZuoMBDM())).uniqueResult();
//				}
//				//如果确实不存在 生成新操作模版
//				if(caoZuoMB==null){
//					caoZuoMB = new CaoZuoMB();
//					caoZuoMB.setCaoZuoMBDH(gncz.getCaoZuoDH());
//					caoZuoMB.setGongNengCZ(gncz);
//					caoZuoMB.setCaoZuoMBMC(gncz.getGongNeng().getGongNengMC()+"-"+gncz.getCaoZuoMC());
//					caoZuoMB.setCaoZuoMBLJ(gn.getXiTong().getXiTongDH()+"/"+gn.getGongNengLB().getGongNengLBDH()+"/"+gn.getGongNengDH()+"/");
//					//模版类别
//					if(gncz.getCaoZuoDH().equalsIgnoreCase("list") && (gncz.getCaoZuoLB().getCaoZuoLBDM().intValue()!= CaoZuoLB.Report)){
//						if(gn.getShiFouLCGN()!=null && gn.getShiFouLCGN()){
//							caoZuoMB.setMoBanLB((MoBanLB)sess.load(MoBanLB.class, MoBanLB.ListPocess));
//						}else{
//							caoZuoMB.setMoBanLB((MoBanLB)sess.load(MoBanLB.class, MoBanLB.List));
//						}
//					}else if(gncz.getCaoZuoLB().getCaoZuoLBDM().intValue() == CaoZuoLB.FormView ){
//						caoZuoMB.setMoBanLB((MoBanLB)sess.load(MoBanLB.class, MoBanLB.FormView));
//						caoZuoMB.setJiChuYM("form.html");
//					}else if(gncz.getCaoZuoLB().getCaoZuoLBDM().intValue() == CaoZuoLB.Form ){
//						caoZuoMB.setMoBanLB((MoBanLB)sess.load(MoBanLB.class, MoBanLB.Form));
//						caoZuoMB.setJiChuYM("form.html");
//					}else if(gncz.getCaoZuoLB().getCaoZuoLBDM().intValue() == CaoZuoLB.ProcessFormView ){
//						caoZuoMB.setMoBanLB((MoBanLB)sess.load(MoBanLB.class, MoBanLB.ProcessFormView));
//						caoZuoMB.setJiChuYM("form.html");
//					}else if(gncz.getCaoZuoLB().getCaoZuoLBDM().intValue()== CaoZuoLB.Report ){
//						caoZuoMB.setMoBanLB((MoBanLB)sess.load(MoBanLB.class, MoBanLB.Report));
//					}else if(gncz.getCaoZuoLB().getCaoZuoLBDM().intValue() == CaoZuoLB.UserDefine){
//						caoZuoMB.setMoBanLB((MoBanLB)sess.load(MoBanLB.class, MoBanLB.Form));
//					}
//					//
//					sess.save(caoZuoMB);
//				}else if (caoZuoMB.getCaoZuoMBLJ()==null){
//					caoZuoMB.setCaoZuoMBLJ(gn.getXiTong().getXiTongDH()+"/"+gn.getGongNengLB().getGongNengLBDH()+"/"+gn.getGongNengDH()+"/");
//				}
//				//为form新增了html  暂时全部重新设置
//				if(gncz.getCaoZuoLB().getCaoZuoLBMC().equalsIgnoreCase("FORM") ){
//					caoZuoMB.setJiChuYM("form.html");
//				}
//				//保存链接
//				gncz.setCaoZuoMB(caoZuoMB);
//				sess.update(gncz);
//				if(gncz.getCaoZuoDH().equalsIgnoreCase("list")){
//					listGncz = gncz;
//				}
//			}
//		}
//		//为list功能 再生成一个pageSize:40的模板
//		if(listGncz != null){
//			CaoZuoMB caoZuoMB40 = (CaoZuoMB)sess.createCriteria(CaoZuoMB.class)
//					.add(Restrictions.eq("gongNengCZ.id", listGncz.getGongNengCZDM()))
//					.add(Restrictions.eq("caoZuoMBDH", listGncz.getCaoZuoDH()+"40"))
//					.uniqueResult();
//			if(caoZuoMB40==null){
//				caoZuoMB40 = new CaoZuoMB();
//				caoZuoMB40.setCaoZuoMBDH(listGncz.getCaoZuoDH()+"40");
//				caoZuoMB40.setGongNengCZ(listGncz);
//				caoZuoMB40.setCaoZuoMBMC(listGncz.getGongNeng().getGongNengMC()+"-"+listGncz.getCaoZuoMC()+"(大屏幕尺寸)");
//				caoZuoMB40.setCaoZuoMBLJ(gn.getXiTong().getXiTongDH()+"/"+gn.getGongNengLB().getGongNengLBDH()+"/"+gn.getGongNengDH()+"/");
//				//模版类别
//				if(gn.getShiFouLCGN()!=null && gn.getShiFouLCGN()){
//					caoZuoMB40.setMoBanLB((MoBanLB)sess.load(MoBanLB.class, MoBanLB.ListPocess));
//				}else{
//					caoZuoMB40.setMoBanLB((MoBanLB)sess.load(MoBanLB.class, MoBanLB.List));
//				}
//				//
//				sess.save(caoZuoMB40);
//			}
//		}
//		
//		//取得此功能下 所有的操作模版 检查并生成相关定义文件
//		List<?> czmbs = sess.createCriteria(CaoZuoMB.class)
//				.createAlias("gongNengCZ", "czmb_gncz")
//				.add(Restrictions.eq("czmb_gncz.gongNeng.id", gn.getGongNengDM()))
//				.list();
//		for(Object caoZuoMBObj:czmbs){
//			CaoZuoMB caoZuoMB = (CaoZuoMB)caoZuoMBObj;
//			root.put("gncz", caoZuoMB.getGongNengCZ());
//			root.put("czmb", caoZuoMB);
//			if(caoZuoMB.getCaoZuoMBDH().equals(caoZuoMB.getGongNengCZ().getCaoZuoDH()+"40")){
//				root.put("limit", 40);
//			}else{
//				root.put("limit", 20);
//			}
//			
//			String firstUpGnczDH = caoZuoMB.getCaoZuoMBDH().replaceFirst(caoZuoMB.getCaoZuoMBDH().substring(0, 1),caoZuoMB.getCaoZuoMBDH().substring(0, 1).toUpperCase());
//			//
//			
//			//目标路径是否存在
//			File caoZuoMBPath = new File(BaseService.contextPath+XiTongCsUtils.getModelFilePath()+caoZuoMB.getCaoZuoMBLJ());
//			if(!caoZuoMBPath.exists()){
//				caoZuoMBPath.mkdirs();
//			}
//			
//			File defFile = new File(BaseService.contextPath+XiTongCsUtils.getModelFilePath()+caoZuoMB.getCaoZuoMBLJ()+gn.getGongNengDH()+firstUpGnczDH+".def.xml");
//			if(overwrite || !defFile.exists()){
//				Template defTemplate = freemarkerCfg.getTemplate("/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+"/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+".def.xml.ftl");
//				defTemplate.setEncoding("UTF-8");
//				out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(defFile),"UTF-8"));
//				defTemplate.process(root,out);
//				out.flush();
//				out.close();
//			}
//			
//			//页面文件
//			File ftlFile = new File(BaseService.contextPath+XiTongCsUtils.getModelFilePath()+caoZuoMB.getCaoZuoMBLJ()+gn.getGongNengDH()+firstUpGnczDH+".ftl");
//			File xmlFile = new File(BaseService.contextPath+XiTongCsUtils.getModelFilePath()+caoZuoMB.getCaoZuoMBLJ()+gn.getGongNengDH()+firstUpGnczDH+".xml");
//			File cssFile = new File(BaseService.contextPath+XiTongCsUtils.getModelFilePath()+caoZuoMB.getCaoZuoMBLJ()+gn.getGongNengDH()+firstUpGnczDH+".css");
//			File jsFile = new File(BaseService.contextPath+XiTongCsUtils.getModelFilePath()+caoZuoMB.getCaoZuoMBLJ()+gn.getGongNengDH()+firstUpGnczDH+".js");
//			if(overwrite){
//				if(ftlFile.exists()) ftlFile.delete();
//				if(xmlFile.exists()) xmlFile.delete();
//				if(cssFile.exists()) cssFile.delete();
//				if(jsFile.exists()) jsFile.delete();
//			}
//			
//			if(!ftlFile.exists()){
//				Template ftlTemplate = freemarkerCfg.getTemplate("/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+"/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+".ftl.ftl");
//				ftlTemplate.setEncoding("UTF-8");
//				out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(ftlFile),"UTF-8"));
//				ftlTemplate.process(root,out);
//				out.flush();
//				out.close();
//				//只要ftl不存在 就重新生成xml文件
//				Template xmlTemplate = freemarkerCfg.getTemplate("/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+"/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+".xml.ftl");
//				xmlTemplate.setEncoding("UTF-8");
//				out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(xmlFile),"UTF-8"));
//				xmlTemplate.process(root,out);
//				out.flush();
//				out.close();
//				//只要ftl不存在 就重新生成js文件
//				Template jsTemplate = freemarkerCfg.getTemplate("/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+"/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+".js.ftl");
//				jsTemplate.setEncoding("UTF-8");
//				out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(jsFile),"UTF-8"));
//				jsTemplate.process(root,out);
//				out.flush();
//				out.close();
//				//只要ftl不存在 就重新生成css文件
//				Template cssTemplate = freemarkerCfg.getTemplate("/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+"/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+".css.ftl");
//				cssTemplate.setEncoding("UTF-8");
//				out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(cssFile),"UTF-8"));
//				cssTemplate.process(root,out);
//				out.flush();
//				out.close();
//			}
//			//form新增了js 不存在的话 暂时全部重新生成
//			if(!jsFile.exists() ){
//				//只要js不存在 就重新生成js文件
//				Template jsTemplate = freemarkerCfg.getTemplate("/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+"/"+caoZuoMB.getMoBanLB().getMoBanLBDH()+".js.ftl");
//				jsTemplate.setEncoding("UTF-8");
//				out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(jsFile),"UTF-8"));
//				jsTemplate.process(root,out);
//				out.flush();
//				out.close();
//			}
//			if(caoZuoMB.getMoBanLB().getMoBanLBDM().intValue() == MoBanLB.Report){
//				//为报表功能生成报表cpt文件及相关数据源 打开对应功能及操作的webservice访问许可
//				WebServiceServlet.doGenerateReportCZMB(BaseService.contextPath,caoZuoMB);
//			}
//			
//		}
//	}
//	
//	
//	
//	
//	
////	/**
////	 * 描述本次导出的功能信息
////	 * @param gn
////	 * @return
////	 */
////	private void exportGongNengDefine(File gnDefFile,GongNeng gnObj) throws Exception{
////		Session sess = HibernateSessionFactory.getSession();
////		
////		
////	}
//	
//	/**
//	 * 输出json格式数据库数据
//	 * @param stl
//	 * @param obj
//	 * @return
//	 */
//	private String getData(ShiTiLei stl,Object obj){
//		//检查客户端是否传递来了字段要求
//		JSONArray fieldArray = DataUtils.getFieldMetaFromSTL(stl,true); 
//		JSONArray fieldMeta = DataUtils.getMetaFromField(stl,fieldArray,true);
//		//转换为Json格式
//		JSONObject data = DataUtils.getJsonDataOfObject(stl,obj,fieldMeta);
//		return data.toString();
//	}
}
