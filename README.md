# SHP
一个简单的基于express的后台代码


#程序参考

程序整体结构~~抄袭~~参考`ghost`程序博客程序，后台校验等小模块~~抄袭~~参考`thinkjs`框架，`router`设置样式~~抄袭~~参考`sails`框架，文件监视工具~~抄袭~~参考`supervisor`。多进程章节抄袭《深入浅出nodejs》......

##安装使用

首先：

	npm install  //安装依赖

然后：

    node index	//启动程序

或

	node index -m  //开启多进程

或

    node ./bin/watch //开启调试模式
    
    

#程序结构

整体目录：

```
------
	|
    |- application    //应用程序目录，包括前后台
    |
    |- bin			//调试启动文件
    |
    |- lib			//后台框架核心
    |
    |- config.js 	 //配置文件
    |
    |- index.js 	  //启动文件

```


应用程序写在application文件夹内。

```
------
	|
    |- assets   //静态资源
    |
    |- controllers //controller层
    |
    |- models   //model层
    |
    |- routes   //路由层
    |
    |- views   //模板层

```

#简介

程序启动，会自动加载controller和model层代码，并将其加载到两个全局变量：C和M。


+ routes： URL 和 controller层的映射。
+ controller：负责所有前端输入参数校验、转换等操作，确保传入model层的参数正确。
+ model：负责查询数据库，将结果返回，确保返回的数据为最终结果。


#全局变量

+ C 代表controller层代码集合。程序启动后，可以通过`C.文件名.方法名`进行调用。
+ M 代表model层代码集合。程序启动后，可以通过`M.文件名.方法名`进行调用。
+ DB 代表数据库操作对象，只是对node-mysql的简单封装，供M层使用。


#自动升级
程序自动升级功能，但升级需要和nssm或者pm2结合使用，并且升级非热升级。

升级结构
```
------
	|
	|---v0.0.1
	|
	|
	|---v0.0.2
	|
	|
	|---start.js(动态生成)
```