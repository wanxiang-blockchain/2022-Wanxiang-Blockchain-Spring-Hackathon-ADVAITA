var util = require('/utils/util.js')
const viModel = require('/utils/viModel');
const observer = require('/utils/observer');
var config = require('/config');
App({
	
	onLaunch: function() {
		//页面加载时候
		const resData = {
			mainColor: '#303135',
			subColor: '#666666',
			adornColor:'#FF623E'
		}
		// 发送通知，变更色值
		observer.postNotice('kNoticeVi', resData)
		// 将色值存储到model对象中，便于后期使用
		const { mainColor, subColor, adornColor} = resData
		viModel.save(mainColor, subColor, adornColor)
		
	},
	data: {},
	/**
	 * 公用设置
	 * @param options 页面初始化参数
	 * @param page_this 页面当前this
	 * @param func 回掉方法
	 */
	commonInit: function(options, page_this, func) {
		this.autoUpdate(); //检测更新

		let resSystem = wx.getSystemInfoSync()
		page_this.setData({
			windowHeight: resSystem.windowHeight,
			windowWidth: resSystem.windowWidth,
			windowIsBang: (resSystem.windowWidth / resSystem.windowHeight < 0.47 && resSystem.windowWidth / resSystem.windowHeight >
				0.4616 ? true : false), //判断是否刘海
			statusBarHeight: resSystem.statusBarHeight,
			navHeight: resSystem.system.indexOf("iOS") > -1 ? 44 : 48,
			isIos:resSystem.system.indexOf("iOS") > -1
		})

		//获取当前页面路径
		var pages = getCurrentPages();
		var pages_url = pages[pages.length - 1].__route__;
		var pages_len = pages.length;
		//拆分，获取/后的内容
		var str = pages_url.lastIndexOf("\/");
		pages_url = pages_url.substring(str + 1, pages_url.length);
		console.log('pages');
		console.log(pages);
		console.log('当前页面');
		console.log(pages_url);

		var is_menu = false;
		switch (pages_url) {
			case 'index':
			case 'HomePage':
			case 'cart':
			case 'publishList':
			case 'personal':
				is_menu = true;
				break;
		}
		wx.setStorageSync('pages_url', pages_url);
		page_this.setData({
			pages_url: pages_url,
			pages_len: pages_len,
			is_auth: false,
			is_menu: is_menu,
			source_system: 'world2_store',
			_GET: options,
		})

		var tokenInfo = wx.getStorageSync('tokenInfo');
		//分享点的进来设置返点人
		if (options.new_index_user_id != '' && options.new_index_user_id != undefined && wx.getStorageSync('index_user_id') !=
			options.new_index_user_id) {
			wx.setStorageSync('index_user_id', options.new_index_user_id);
			wx.removeStorageSync('tokenInfo');
			wx.removeStorageSync('session_key');
		}
		if (options.code != '' && options.code != undefined && wx.getStorageSync('code') != options.code) {
			wx.setStorageSync('code', options.code)
		}
		if (options.share_user_id != '' && options.share_user_id != undefined && wx.getStorageSync('share_user_id') !=
			options.share_user_id) {
			wx.removeStorageSync('tokenInfo');
			wx.removeStorageSync('session_key');
			wx.removeStorageSync('select_share_user_id')
			wx.setStorageSync('share_user_id', options.share_user_id)
		}

		if (options.db_wechat_user_id != '' && options.db_wechat_user_id != undefined && wx.getStorageSync('db_wechat_user_id') !=
			options.db_wechat_user_id) {
				wx.removeStorageSync('tokenInfo');
				wx.removeStorageSync('session_key');
				wx.removeStorageSync('select_db_wechat_user_id')
				wx.setStorageSync('db_wechat_user_id', options.db_wechat_user_id)	
		}

		// 兼容处理
		// page_this.setData({canIUse: wx.canIUse('button.open-type.contact')})
		//缓存页面参数
		wx.setStorageSync('_GET', options);

		var app = this;

		//设置店铺
		if (options.shop_id) {
			var shop_id = options.shop_id;
		} else {
			//默认为瑜伽店铺
			var shop_id = config.config()["app_info"].shop_id || 25;
		}
		var watch_shop_id = config.config()["app_info"].watch_shop_id || 25;
		wx.setStorageSync('shop_id', shop_id);
		wx.setStorageSync('watch_shop_id', watch_shop_id);

		//网络判断
		wx.getNetworkType({
			success: function(res) {
				// 返回网络类型, 有效值：
				// wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
				var networkType = res.networkType
				if (networkType == 'none') {
					wx.redirectTo({
						url: '../linkErr/linkErr?text=您断了个网'
					})
				}
			}
		})

		//用户授权信息
		app.getUserInfo(function(tokenInfo) {
			//用户信息
			console.log('用户信息');
			console.log(tokenInfo);

			page_this.setData({
				userInfo: tokenInfo,
			})
			//分享链接点击记录
			var shareClick_data = {
				click_user_id: tokenInfo.user_id,
				share_user_id: wx.getStorageSync('_GET').share_user_id || '',
				share_url: wx.getStorageSync('_GET').share_false_url || '',
				request_token: tokenInfo.request_token,
				share_type: 1,
				shop_id: shop_id,
			};
			//小程序专属二维码扫码进来
			var scene = options.scene
			if (scene && scene != 'undefined' && scene != undefined) {
				if(scene.indexOf('sid=')>-1){
					let arr = decodeURIComponent(scene).split('sid=')
					let id = arr[1]
					if (id) {
						let num = id.match(/\d*/gi)[0]
						wx.setStorageSync('share_user_id', num);
						let params = wx.getStorageSync('_GET') || {};
						params.share_user_id = num
						params.share_false_url = new Date().getTime()
						wx.setStorageSync('_GET', params);
						shareClick_data.share_user_id = num
						util.ajax({
							url: util.config('baseApiUrl') + 'Api/Wechat/shareClick/app_type/world2xcx/app_version/1',
							data: shareClick_data,
							method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
							header: {
								'Accept': 'application/json'
							},
							success: function(res) {
								
							}
						})
					}
					console.log('scene', scene)
					// 共修
					if (arr[0] == 'p=SN_') {
						wx.reLaunch({
							url: "/pageHappy/pageHappy/shareNight/shareNight"
						});
					} else if (arr[0] == 'p=S_') {
						// 厦大活动
						wx.reLaunch({
							url: "/pages/shop/shop"
						});
					} else if (arr[0] == 'p=WD_') {
						// 我的作品
						wx.reLaunch({
							url: "/pages/shop/shop"
						});
					}
				}else{
					// 商品详情页gid_123iud_123
					let arr = scene.split('iud_')
					let goods = arr[0].split('gid_')[1] || ''
					shareClick_data.share_user_id = arr[1]
					util.ajax({
						url: util.config('baseApiUrl') + 'Api/Wechat/shareClick/app_type/world2xcx/app_version/1',
						data: shareClick_data,
						method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
						header: {
							'Accept': 'application/json'
						},
						success: function(res) {
							wx.reLaunch({
								url: "/pageShop/pageShop/shopDetail/shopDetail?goods_id="+goods
							});
						}
					})
					
				}
			}

			//有新的分销商id
			if (wx.getStorageSync('_GET').channel_user_id) {
				console.log('参数channel_user_id')
				console.log(wx.getStorageSync('_GET').channel_user_id)
				shareClick_data.channel_user_id = wx.getStorageSync('_GET').channel_user_id;
			} //end 有新的分销商id

			//分享点击记录
			if (wx.getStorageSync('_GET').share_user_id && wx.getStorageSync('_GET').share_false_url) {
				console.log('参数share_user_id、share_false_url')
				console.log(wx.getStorageSync('_GET').share_user_id + '、' + wx.getStorageSync('_GET').share_false_url)
				wx.setStorageSync('share_user_id', wx.getStorageSync('_GET').share_user_id)
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/Wechat/shareClick/app_type/world2xcx/app_version/1',
					data: shareClick_data,
					method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
					header: {
						'Accept': 'application/json'
					},
					success: function(res) {
						console.log('User/shareClick返回：');
						console.log(res);
					}
				})
			}

			if(wx.getStorageSync('user_id')==''){
				//未登录的不允许转发
				wx.hideShareMenu({
					menus: ['shareAppMessage', 'shareTimeline']
				})
			}

			// if(tokenInfo!=false){
			func(tokenInfo); //最后方法执行完返回信息
			// }
		}, page_this);
	},

	/**
	 * 【点击确定授权】授权用户信息
	 * @param res 微信授权回调参数
	 * @param that 页面当前this
	 * @param fun 回调方法
	 */
	clickGetUserInfo: function(res, that, func) {
		var app = this;
		var that2 = this;
		res = res.detail;

		if (res.errMsg == "getUserInfo:ok") {
			var wecha_id = wx.getStorageSync('wecha_id')
			//缓存微信用户信息
			wx.setStorageSync('wxUserInfo', res.userInfo)

			// 将微信用户信息提交到后台
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Compress/world2xcxIndex/',
				data: {
					encrypted_data: res.encryptedData,
					iv: res.iv,
					session_key: wx.getStorageSync('session_key'),
					shop_id: wx.getStorageSync('shop_id'),
					share_user_id: wx.getStorageSync('share_user_id'),
					source_system: wx.getStorageSync('source_system'),
					to_auth_user_id: wx.getStorageSync('to_auth_user_id'),
				},
				method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
				success: function(res2) {
					// 保存request_token信息
					console.log('Wechat/xcxSetUser接口返回：')
					console.log(res2)
					if (res2.msg == 'ok') {
						// var tokenInfo = app.getUserInfoInit(res2);
						var tokenInfo = that2.getUserInfoInit(res2);
						that.setData({
							userInfo: tokenInfo,
						})
						func(tokenInfo);
						return true;
					} else {
						//重新授权
						wx.removeStorageSync('tokenInfo');
						// wx.removeStorageSync('request_token');
						wx.removeStorageSync('session_key');
						//用户授权信息
						app.getUserInfo(function(tokenInfo) {
							// that.clickGetUserInfo(res,that,func);
						}, that)
						app.alert_s('登录失败，请重试', that);
					}
				}
			})
		} else {
			console.log(res)
			// 授权失败，跳转到其他页面
			wx.reLaunch({
				url: '../msg/msg_fail'
			})
		}
		func(false);
	},
	//检测更新版本
	autoUpdate: function() {
		var self = this
		// 获取小程序更新机制兼容
		if (wx.canIUse('getUpdateManager')) {
			const updateManager = wx.getUpdateManager()
			if(updateManager){
				//1. 检查小程序是否有新版本发布
				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					if (res.hasUpdate) {
						//2. 小程序有新版本，则静默下载新版本，做好更新准备
						updateManager.onUpdateReady(function() {
							wx.showModal({
								title: '更新提示',
								content: '新版本已经准备好，是否重启应用？',
								success: function(res) {
									if (res.confirm) {
										//3. 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
										updateManager.applyUpdate()
									} else if (res.cancel) {
										//如果需要强制更新，则给出二次弹窗，如果不需要，则这里的代码都可以删掉了
										wx.showModal({
											title: '温馨提示~',
											content: '本次版本更新涉及到新的功能添加，旧版本无法正常访问的哦~',
											success: function(res) {
												self.autoUpdate()
												return;
												//第二次提示后，强制更新           
												if (res.confirm) {
													// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
													updateManager.applyUpdate()
												} else if (res.cancel) {
													//重新回到版本更新提示
													self.autoUpdate()
												}
											}
										})
									}
								}
							})
						})
						updateManager.onUpdateFailed(function() {
							// 新的版本下载失败
							wx.showModal({
								title: '已经有新版本了哟~',
								content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
							})
						})
					}
				})
			}
		} else {
			// 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
			wx.showModal({
				title: '提示',
				content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
			})
		}
	},
	/**
	 * 轮播广告位
	 */
	getSlideList: function(poster_id, func) {
		var tokenInfo = wx.getStorageSync('tokenInfo');
		var send_data = {
			poster_id: poster_id,
			// user_id:tokenInfo.user_id,
			// request_token:tokenInfo.request_token,
			app_type: util.config("app_info").app_type || '',
			app_version: 1
		}
		var url = util.config('baseApiUrl') + "Api/Poster/slideList";
		util.ajax({
			url: url,
			data: send_data,
			method: "GET",
			success: function(res) {
				if (res.error == 0) {
					var slideList = res.data;
					func(slideList)
				}
			},
			complete: function(res) {}
		});
	},
	/**
	 * 发起新团、获取团详情
	 * @param func 回调方法
	 */
	autoMergeGroup: function(func) {
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var user_id = wx.getStorageSync('user_id');
		var shop_id = wx.getStorageSync('shop_id');
		var index_user_id = wx.getStorageSync('index_user_id');
		// var merge_group_info = wx.getStorageSync('merge_group_info');
		var url = util.config('baseApiUrl') + "Api/Orders/addMergeGroup";
		var data = {
			app_type:util.config("app_info").app_type || '',
			app_version: 1,
			shop_id: shop_id,
			user_id: user_id,
			request_token: tokenInfo.request_token
		}

		//如果有分享过来的话就用分享过来人的id
		if (index_user_id) {
			data.leader_user_id = index_user_id;
		} else {
			data.leader_user_id = user_id;
		}

		// if(
		//   merge_group_info==undefined
		//   ||merge_group_info==''
		//   ||util.stringToInt(merge_group_info.end_time)*1000<new Date().getTime()//团结束了
		//   ||data.user_id != merge_group_info.user_id //不是同一用户的
		//   ||(merge_group_info.expire_time < new Date().getTime() && merge_group_info.expire_time>0)//缓存过期
		// ){
		util.ajax({
			"url": url,
			"data": data,
			"success": function(res) {
				console.log('发起新团')
				console.log(res)
				if (res.msg == 'ok') {
					// wx.showToast({
					//   title: '发起新团',
					//   icon: 'success',
					//   duration: 1000
					// })
					wx.setStorageSync('merge_group_orders_id', res.data.merge_group_orders_id)
					// res.data.expire_time =new Date().getTime() + 30 * 1000;//缓存30秒
					wx.setStorageSync('merge_group_info', res.data)
				}
				func(res.data)
			}
		});
		// }else{
		//   func(merge_group_info)
		// }
	},
	/**
	 * 获取店铺列表
	 */
	getShopList: function(page_this) {
		var tokenInfo = wx.getStorageSync('tokenInfo');
		var url = util.config('baseApiUrl') + "Api/Shop/getList";
		var data = {
			app_type: util.config("app_info").app_type || '',
			app_version: 1,
			user_id: 1
		}
		util.ajax({
			"url": url,
			"data": data,
			"success": function(res) {
				if (res.error == '0') {
					var shopList = res.data;
					for (var i = 0; i < shopList.length; i++) {
						if (wx.getStorageSync('shop_id') == shopList[i].shop_id) {
							// wx.setStorageSync('shop_name',shopList[i].shop_name);
							// shopList[i].checked = true;
							page_this.setData({ shop_name: shopList[i].shop_name })
						}
					}
					page_this.setData({ shopList: shopList })
				}
			}
		});
	},
	/**
	 * 开团,判断是否验证手机号，已经验证的，回到主页
	 * @param func 回调方法
	 */
	openMergeGroup: function() {
		// 判断是否验证手机号和是否有开团权限，已经验证的，回到主页
		var tokenInfo = wx.getStorageSync('tokenInfo');
		if (tokenInfo.phone == '') {
			wx.showModal({
				title: "开团功能目前仅对瑜伽专业人士(馆，工作室，老师)开放，如果您是专业人士请点‘申请’按钮注册。",
				content: '',
				confirmText: '确认',
				success: function(res) {
					if (res.confirm) {
						wx.navigateTo({
							url: '../register/register'
						})
					}
				}
			})
		} else if (tokenInfo.is_allow_channel != "0" && tokenInfo.user_type_audit_state == "0" && tokenInfo.is_upload_prove_image ==
			'0') {
			//完善资料
			wx.showModal({
				title: "",
				content: "请您继续上传证明、填写姓名",
				confirmText: '申请',
				success: function(res) {
					if (res.confirm) {
						wx.navigateTo({
							url: '../uploadData/uploadData'
						})
					}
				}
			})
		} else if (tokenInfo.user_type_audit_state == "0" && tokenInfo.phone != '') {
			//审核中，重新获取一次开团
			wx.removeStorageSync('tokenInfo');
			wx.removeStorageSync('session_key');
			wx.showModal({
				title: "目前您用户身份在审核中。。",
				content: '',
				showCancel: false,
				confirmText: '确认',
				success: function(res) {
					wx.reLaunch({
						url: '../HomePage/HomePage'
					})
				}
			})
		} else {
			wx.reLaunch({
				url: '../HomePage/HomePage'
			})
		}
	},
	/**
	 * 获取商品分类
	 * @param shop_id 店铺id
	 * @param func 回调方法
	 */
	getGoodsType: function(shop_id, func) {
		// 测试
		shop_id = 1;
		var typeData = wx.getStorageSync('shopType_' + shop_id);
		if (typeData == undefined || typeData == '' || (typeData.expire_time < new Date().getTime() && typeData.expire_time >
				0)) {
			// 商品分类
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Goods/typeList/app_type/world2xcx/app_version/1/shop_id/' + shop_id,
				data: {},
				method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
				header: {
					'Accept': 'application/json'
				}, // 设置请求的 header
				success: function(res3) {
					res3.expire_time = new Date().getTime() + 300 * 1000; //缓存5分钟
					wx.setStorageSync('shopType_' + shop_id, res3);
					func(res3);
				}
			})
		} else {
			func(typeData);
		}
	},
	/**
	 * 添加分享数据配置
	 * @param controller 
	 * @param action 
	 * @requires app.commonInit(options);
	 */
	shareInit: function(controller, action) {
		var _GET = wx.getStorageSync('_GET');
		var DeviceIdentity = wx.getStorageSync('DeviceIdentity');
		var user_id = wx.getStorageSync('user_id');
		var shop_id = wx.getStorageSync('shop_id');
		var index_user_id = wx.getStorageSync('index_user_id');
		var share_user_id = wx.getStorageSync('share_user_id');
		var tokenInfo = wx.getStorageSync('tokenInfo');
		var share_false_url = new Date().getTime(); //伪造分享地址
		var share_url = '/pages/' + controller + '/' + action + '?shop_id=' + shop_id + '&share_user_id=' + user_id +
			'&share_false_url=' + share_false_url; //实际分享地址

		if (DeviceIdentity) {
			share_url = share_url + '&DeviceIdentity=' + DeviceIdentity;
		}
		if (index_user_id) {
			share_url = share_url + '&new_index_user_id=' + index_user_id;
		}
		if (tokenInfo.channel_relation && tokenInfo.channel_relation.invitation_code != undefined && tokenInfo.channel_relation
			.invitation_code != '') {
			share_url = share_url + '&code=' + tokenInfo.channel_relation.invitation_code;
		}


		// if(share_user_id){
		//   share_url = share_url + '&share_user_id=' + share_user_id;
		// }
		//带上参数
		if (_GET) {
			for (var k in _GET) {
				if (k != 'DeviceIdentity' && k != 'shop_id' && k != 'share_user_id' && k != 'index_user_id' && k !=
					'new_index_user_id' && k != 'code' && k != 'is_need_bind' && k != 'share_false_url' && k != 'is_admin') {
					
					if(k=='url'||k=='link'){
						share_url = share_url + '&' + k + '=' + encodeURIComponent(_GET[k]);
					}else{
						share_url = share_url + '&' + k + '=' + _GET[k];
					}
				}
			}
		}
		console.log('分享地址');
		console.log(share_url);
		return {
			user_id: user_id, //分享人用户id
			share_url: share_false_url,
			share_true_url: share_url,
			'module': 'pages',
			controller: controller,
			action: action,
			share_type: 1, //分享给朋友
			shop_id: shop_id, //分享店铺
		};
	},
	/**
	 * [作废]获取分销商信息
	 * 优先数据说明：1、自己是分销商则返回自己的信息，2、有分销商id的则返回分销商id信息，3、有购买记录最后一单记录到分销商id则返回该信息，4、有最后分销商分享记录的则返回改分销商信息
	 * @param channel_user_id 分销商id
	 * @param func 回调方法
	 */
	getChannelInfo: function(channel_user_id, func) {
		var tokenInfo = wx.getStorageSync('tokenInfo');
		var data = {
			user_id: wx.getStorageSync('user_id'),
			request_token: wx.getStorageSync('request_token'),
			shop_id: wx.getStorageSync('shop_id')
		};

		//获取最新分销商信息
		if (channel_user_id) {
			data.channel_user_id = channel_user_id

			//有缓存就直接读取缓存返回
			var channelInfo = wx.getStorageSync('channelInfo_' + data.user_id + '_' + data.shop_id + '_' + channel_user_id);
			if (channelInfo) {
				func(channelInfo);
				return true;
			}
		} else {
			//读自己有缓存就直接读取缓存返回
			var channelInfo = wx.getStorageSync('channelInfo_' + data.user_id + '_' + data.shop_id + '_' + wx.getStorageSync(
				'channel_user_id'));
			if (channelInfo) {
				func(channelInfo);
				return true;
			}
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/getChannelS/app_type/world2xcx/app_version/1',
			data: data,
			method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
			header: {
				'Accept': 'application/json'
			}, // 设置请求的 header
			success: function(res) {
				//更换缓存
				// console.log('获取分销商信息:User/getChannelS')
				// console.log(res)
				wx.setStorageSync('channel_user_id', res.data.channel_user_id);
				wx.setStorageSync('channelInfo', res.data);

				if (res.msg == 'ok') {
					wx.setStorageSync('channelInfo_' + data.user_id + '_' + data.shop_id + '_' + res.data.channel_user_id, res.data);
					func(res.data);
				}
			}
		})
	},

	/*
	 * 获取用户信息
	 * @param func 回调执行方法
	 */
	getUserInfo: function(func, page_this) {
		var _GET = wx.getStorageSync('_GET');
		var baseApiUrl = util.config('baseApiUrl');
		//过期重新获取
		var tokenInfo = wx.getStorageSync('tokenInfo');
		var session_key = wx.getStorageSync('session_key');
		var that = this;

		//这里测试时候关闭调比较好，因为在两处不同地方用request_token会发生错误
		// if(tokenInfo==undefined||tokenInfo==''||(tokenInfo.expire_time < new Date().getTime() && tokenInfo.expire_time>0)){
		if (wx.getStorageSync('union_id')=='' || session_key == undefined || session_key == '' || tokenInfo == undefined || tokenInfo == '') {
			//调用登录接口
			wx.login({
				success: function(ress) {
					console.log('ress')
					console.log(ress)
					if (ress.code) {
						//获取openid
						util.ajax({
							url: baseApiUrl + 'Api/Wechat/xcxGetOpenid/',
							data: {
								app_type: util.config("app_info").app_type || '',
								app_version: 2,
								code: ress.code,
								shop_id: wx.getStorageSync('watch_shop_id'),
								share_user_id: (_GET.share_user_id == undefined ? '0' : _GET.share_user_id),
								source_system: wx.getStorageSync('source_system'),
								to_auth_user_id: wx.getStorageSync('to_auth_user_id'),
								db_wechat_user_id:wx.getStorageSync('db_wechat_user_id'),
							},
							method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
							header: {
								'Accept': 'application/json'
							}, // 设置请求的 header
							success: function(res1) {
								console.log(res1.data.Wechat_xcxGetOpenid);
								if (res1.data.Wechat_xcxGetOpenid != undefined && res1.data.Wechat_xcxGetOpenid != '') {
									//已经授权过
									wx.setStorageSync('wecha_id', res1.data.Wechat_xcxGetOpenid.openid)
									wx.setStorageSync('session_key', res1.data.Wechat_xcxGetOpenid.session_key)
									//回调执行方法
									func(that.getUserInfoInit(res1))
								} else {
									//第一次授权
									wx.setStorageSync('wecha_id', res1.data.openid)
									wx.setStorageSync('session_key', res1.data.session_key)
									wx.setStorageSync('union_id', res1.data.unionid)
									
									// page_this.setData({
									//   is_auth:true
									// })
									func(wx.getStorageSync('tokenInfo'))
								}
							} //end 获取openid success
						}) //end 获取openid
					}
				} //end 调用登录接口 success
			}) //end 调用登录接口
		} else {
			//回调执行方法
			func(wx.getStorageSync('tokenInfo'))
		} //end 过期重新获取
	}, //end getUserInfo

	//用户授权后设置信息
	getUserInfoInit: function(resData) {
		var tokenInfo = resData.data;
		// tokenInfo.expire_time =new Date().getTime() + util.stringToInt(resData.data.expires_in) * 1000;
		tokenInfo.expire_time = new Date().getTime() + util.stringToInt(resData.data.Wechat_xcxSetUser.expires_in) * 1000;
		// console.log(tokenInfo,util.stringToInt(resData.data.expires_in))
		tokenInfo.nickname = tokenInfo.Wechat_xcxSetUser.nickname;
		tokenInfo.avatar_url = tokenInfo.Wechat_xcxSetUser.avatar_url;
		tokenInfo.encryptedData = ''
		tokenInfo.iv = ''
		tokenInfo.session_key = wx.getStorageSync('session_key')
		tokenInfo.exclusive_code_url = [] //商品推广图


		// 缓存用户信息
		tokenInfo.user_id = tokenInfo.Wechat_xcxSetUser.user_id
		tokenInfo.request_token = tokenInfo.Wechat_xcxSetUser.request_token
		tokenInfo.true_name = tokenInfo.Wechat_xcxSetUser.true_name
		tokenInfo.phone = tokenInfo.Wechat_xcxSetUser.phone
		tokenInfo.user_type_code = tokenInfo.Wechat_xcxSetUser.user_type_code
		tokenInfo.user_type_name = tokenInfo.Wechat_xcxSetUser.user_type_name
		tokenInfo.user_type_audit_state = tokenInfo.Wechat_xcxSetUser.user_type_audit_state
		tokenInfo.is_upload_prove_image = tokenInfo.Wechat_xcxSetUser.is_upload_prove_image
		tokenInfo.is_need_register = tokenInfo.Wechat_xcxSetUser.is_need_register
		tokenInfo.user_type_channel_percent_text = tokenInfo.Wechat_xcxSetUser.user_type_channel_percent_text
		tokenInfo.user_type_channel_percent = tokenInfo.Wechat_xcxSetUser.user_type_channel_percent
		tokenInfo.is_channel_generalize = tokenInfo.Wechat_xcxSetUser.is_channel_generalize
		tokenInfo.world2xcx_qr_code = tokenInfo.Wechat_xcxSetUser.world2xcx_qr_code
		tokenInfo.wechat_union_id = tokenInfo.Wechat_xcxSetUser.wechat_union_id

		wx.setStorageSync('request_token', tokenInfo.Wechat_xcxSetUser.request_token)
		wx.setStorageSync('tokenInfo', tokenInfo)
		wx.setStorageSync('tokenInfo', tokenInfo)
		wx.setStorageSync('union_id', tokenInfo.Wechat_xcxSetUser.wechat_union_id)
		wx.setStorageSync('user_id', tokenInfo.Wechat_xcxSetUser.user_id)
		wx.setStorageSync('is_need_register', tokenInfo.Wechat_xcxSetUser.is_need_register)
		wx.setStorageSync('DeviceIdentity', tokenInfo.this_treport_user.device_id)
		wx.setStorageSync('this_treport_user', tokenInfo.this_treport_user)


		// 测试人员正式服显示debug框
		if ((tokenInfo.user_id == '8' || tokenInfo.wechat_union_id == 'orvsUwtSRfyJijTxnkojh0Jb1Ax4' || tokenInfo.wechat_union_id ==
				'orvsUwspYTw_ObqeGLqzhRsqJSEE') && (wx.canIUse('setEnableDebug'))) {
			wx.setEnableDebug({
				enableDebug: true
			})
		}
		return tokenInfo;
	},
	// 拼团规则列表
	getRuleMergeGroup: function(func) {
		var shop_id = wx.getStorageSync('shop_id');
		var data = {
			shop_id: shop_id,
			app_type: util.config("app_info").app_type || '',
			app_version: 1,
			type: 'price'
		}
		// var self = this
		util.ajax({
			"url": util.config('baseApiUrl') + "Api/Shop/getRuleMergeGroup",
			"data": data,
			"success": function(res) {
				// console.log(res)
				if (res.msg == 'ok') {
					wx.setStorageSync('ruleMergeGroupInfo', res)
					func(res.data)
					// return res.data
					// self.setData({
					//   ruleMergeGroupInfo:res.data
					// })
				}
			}
		});
	},
	getAccessToken: function() {

	},
	/**
	 * 打开模版消息
	 */
	openMessage: function(isShowMask) {
		let that = this
		console.log('isShowMask', isShowMask)
		var tokenInfo = wx.getStorageSync('tokenInfo');
		var tmplIds = [];
		var acceptTmplIds = [];
		for (var i = tokenInfo.wechat_message_list.length - 1; i >= 0; i--) {
			if (tokenInfo.wechat_message_list[i].is_subscribe_allow_set == '1') {
				tmplIds.push(tokenInfo.wechat_message_list[i].wechat_template_id);
			}
		}
		console.log(tmplIds)

		if (tmplIds.length >= 1) {
			wx.requestSubscribeMessage({
				tmplIds: tmplIds,
				success(res) {
					console.log('requestSubscribeMessage res::::', res)
					for (var k in res) {
						if (res[k] == "accept") {
							//被同意的模版消息
							console.log(k)
							acceptTmplIds.push({ 'tmp_id': k, 'state': 1 });
						} else {
							if (k != 'errMsg') {
								acceptTmplIds.push({ 'tmp_id': k, 'state': 0 });
							}

						}
					}
					if (isShowMask && res[tmplIds[0]] == "accept") {
						wx.showToast({
							title: '订阅成功',
							icon: 'none',
							duration: 2000
						});
					}
					if (acceptTmplIds.length >= 1) {
						util.ajax({
							url: util.config("baseApiUrl") + 'Api/Wechat/setSubscribeMessage',
							data: {
								accept_tmp_id: acceptTmplIds,
								wechat_open_id: wx.getStorageSync('wecha_id'),
								user_id: wx.getStorageSync('user_id'),
								shop_id: wx.getStorageSync('shop_id'),
							},
							success: function(ress) {
								console.log(ress)
								if (ress.error == 0) {
									console.log(ress)
								}
							}
						})
					}

				}
			})
		}
	},
	// 获取首页轮播tu
	getIndexSlideImg: function(func) {
		var slide_image = wx.getStorageSync('slide_image')
		console.log('app_img')
		console.log(slide_image)
		if (slide_image == undefined || slide_image == '' || (slide_image[0].expire_time < new Date().getTime() &&
				slide_image[0].expire_time > 0)) {
			var shop_id = wx.getStorageSync('shop_id');
			var data = {
				shop_id: shop_id,
				app_type: util.config("app_info").app_type || '',
				app_version: 1
			}
			util.ajax({
				"url": util.config('baseApiUrl') + "Api/Shop/getInfo",
				"data": data,
				"success": function(res) {
					console.log(res)
					if (res.error == 0) {
						var slide_image_set = res.data.slide_image
						// 数组中加入时间戳
						for (var i = slide_image_set.length - 1; i >= 0; i--) {
							slide_image_set[i].expire_time = new Date().getTime() + 300 * 1000
						}
						// slide_image_set.expire_time.concat(new Date().getTime() + 5*60*1000)
						console.log('slide_image_set')
						console.log(slide_image_set)
						func(slide_image_set)
						wx.setStorageSync('slide_image', slide_image_set)
					}
				}
			});
		} else {
			func(slide_image)
		}
	},
	globalData: {
		userInfo: null
	},
	//小程序后台进入小程序
	onShow: function() {
		console.log('App Show')
	},
	//小程序进入后台时候
	onHide: function() {
		//进入客服后消失了主页人，因此屏蔽代码
		// wx.removeStorageSync('share_user_id');//分享人id
		// wx.removeStorageSync('index_user_id');//主页人id

	},


	/**
	 * 显示商品分类，上下
	 */
	showModals: function(page_this) {
		var animation = wx.createAnimation({
			duration: 200,
			timingFunction: "linear",
			delay: 0,
			transformOrigin: "0 0"
		})
		animation.translateY(-(page_this.data.windowHeight * 2 / 3)).step()
		page_this.setData({
			animationDatas: animation.export(),
			showModalStatuss: true,
			isHidden: true
		})
	},
	/**
	 * 隐藏商品分类，上下
	 */
	hideModals: function(page_this) {
		// 隐藏遮罩层
		var animation = wx.createAnimation({
			duration: 100,
			timingFunction: "linear",
			delay: 0
		})
		page_this.animation = animation
		animation.translateY(0).step()
		page_this.setData({
			animationDatas: animation.export(),
		})
		setTimeout(function() {
			page_this.setData({
				showModalStatuss: false,
			})
		}.bind(page_this), 100)
	},
	// 左侧弹窗
	showModal: function(page_this) {
		// 显示遮罩层
		var animation = wx.createAnimation({
			duration: 200,
			timingFunction: "linear",
			delay: 0
		})
		page_this.animation = animation
		animation.translateX(-300).step()
		page_this.setData({
			animationData: animation.export(),
			showModalStatus: true
		})
		setTimeout(function() {
			animation.translateX(0).step()
			page_this.setData({
				animationData: animation.export()
			})
		}.bind(page_this), 200)
	},
	// 左侧弹窗隐藏
	hideModal: function(page_this) {
		// 隐藏遮罩层
		var animation = wx.createAnimation({
			duration: 200,
			timingFunction: "linear",
			delay: 0
		})
		page_this.animation = animation
		animation.translateX(-300).step()
		page_this.setData({
			animationData: animation.export(),
		})
		setTimeout(function() {
			animation.translateX(0).step()
			page_this.setData({
				animationData: animation.export(),
				showModalStatus: false
			})
		}.bind(page_this), 200)
	},
	// 左侧弹窗,拼团规则
	showRuleModal: function(page_this) {
		// 显示遮罩层
		var animation = wx.createAnimation({
			duration: 200,
			timingFunction: "linear",
			delay: 0
		})
		page_this.animation = animation
		animation.translateX(-300).step()
		page_this.setData({
			animationData: animation.export(),
			showRule: true,
			showModalStatus: false,
		})
		setTimeout(function() {
			animation.translateX(0).step()
			page_this.setData({
				animationData: animation.export()
			})
		}.bind(page_this), 200)
	},
	hideRuleModal: function(page_this) {
		// 隐藏遮罩层
		var animation = wx.createAnimation({
			duration: 200,
			timingFunction: "linear",
			delay: 0
		})
		page_this.animation = animation
		animation.translateX(-300).step()
		page_this.setData({
			animationData: animation.export(),
		})
		setTimeout(function() {
			animation.translateX(0).step()
			page_this.setData({
				animationData: animation.export(),
				showRule: false
			})
		}.bind(page_this), 200)
	},
	// 右侧弹窗
	navShow: function(page_this) {
		// 判断是否验证了身份
		var tokenInfo = wx.getStorageSync('tokenInfo')
		/*if(tokenInfo.phone == ''){
		  wx.showModal({
		    title: "请先验证您的身份",
		    content: '',
		    confirmText:'确认',
		    success: function(res) {
		      if (res.confirm) {
		        wx.navigateTo({
		          url: '../register/register'
		        })
		      }
		    }
		  })
		  return false
		}*/

		if (page_this.data.navClass == "") {
			page_this.setData({
				navClass: 'nav-show'
			})
		} else if (page_this.data.navClass == 'nav-show') {
			page_this.setData({
				navClass: ""
			})
		}
	},
	/**
	 * formid写入
	 */
	addXcxFormId: function(form_id) {

	},
	/**
	 * 获取头像昵称
	 */
	getUserProfile: function(that) {
		//let that = this
		// try {
			let res =  util.getUserProfileSave()
			let profileData = res.userInfo
			that.setData({
				loading: true
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Wechat/updateWechatUserInfo',
				data: {
					wechat_name: profileData.nickName,
					wechat_img: profileData.avatarUrl,
					wechat_province: profileData.province,
					wechat_city: profileData.city,
					wechat_county: profileData.country,
					wechat_union_id: wx.getStorageSync('union_id') || '',
					wechat_open_id: wx.getStorageSync('wecha_id') || '',
					shop_id: wx.getStorageSync('watch_shop_id'),
					wechat_sex: profileData.gender
				},
				method: 'GET',
				header: {
					'Accept': 'application/json'
				},
				success: function(ress) {
					if (ress.error == 0||ress.error == 1) {
						console.log(ress);
						var tokenInfo = wx.getStorageSync('tokenInfo');
						tokenInfo.Wechat_xcxSetUser.avatar_url = profileData.avatarUrl;
						tokenInfo.Wechat_xcxSetUser.nickname = profileData.nickName;
						tokenInfo.avatar_url = profileData.avatarUrl;
						tokenInfo.nickname = profileData.nickName;
						wx.setStorageSync('tokenInfo',tokenInfo);
						that.setData({
							userInfo:tokenInfo,
							nickname:profileData.nickName,
							avatar_url:profileData.avatarUrl
						})
					} else {
						that.setData({
							loading: false,
						})
						// setTimeout(() => {
						// 	wx.showToast({
						// 		title: ress.msg,
						// 		icon: 'none',
						// 		duration: 2000
						// 	});
						// }, 0)
					}
				}
			})
		// } catch (e) {
		// 	wx.showToast({
		// 		title: '获取失败',
		// 		icon: 'none',
		// 		duration: 2000
		// 	});
		// }
	},
	/**
	 * 弹出微小提示框
	 * @param text 文本 
	 * @param page_this 页面当前this
	 */
	alert_s: function(text, page_this) {
		page_this.setData({
			alert_s_state: true,
			alert_s_text: text
		})

		setTimeout(function() {
			page_this.setData({
				alert_s_state: false,
				alert_s_text: ''
			})
		}, 2000)

	},
	/**
	 * 弹出中型提示框
	 * @param text 文本 
	 * @param page_this 页面当前this
	 * @param func 3秒后回调执行方法
	 */
	alert_l: function(text, page_this, func) {
		page_this.setData({
			alert_l_state: true,
			alert_l_text: text
		})

		setTimeout(function() {
			page_this.setData({
				alert_l_state: false,
				alert_l_text: ''
			});
			func(true);
		}, 3000)
	},

})
