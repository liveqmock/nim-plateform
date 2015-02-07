package com.poweruniverse.nim.plateform.servlet;
import javax.servlet.ServletException;
import javax.servlet.SingleThreadModel;
import javax.servlet.http.HttpServlet;

import org.quartz.Scheduler;
import org.quartz.SchedulerException;


@SuppressWarnings("deprecation")
public class ScheduleTaskServlet extends HttpServlet implements  SingleThreadModel {
	private static final long serialVersionUID = 1L;
	public static Scheduler scheduler = null;
//	private SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");

	public void destroy() {
		try {
			scheduler.shutdown();
		} catch (SchedulerException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void init() throws ServletException {
		super.init();
//		try {
//			SchedulerFactory sf = new StdSchedulerFactory();
//			scheduler = sf.getScheduler();
//
//			scheduler.start();
//		} catch (Exception e1) {
//			e1.printStackTrace();
//		}
	}

}
