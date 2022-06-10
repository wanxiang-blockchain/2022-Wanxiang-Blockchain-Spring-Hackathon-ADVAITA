var util = require('../../../utils/util.js');
var app = getApp()

Page({
	data: {
		id: 0,
		type: 'indexes-1',
		scrollTop: 0,
		nickname: '未登录',
		avatar_url: 'http://i.2fei2.com/5df32bcad8ab3.png',
		treport: false,
		//展开隐藏
		isShowMove: false,
		isNeedBind: false,
		isShowBlock: true,
		currentTop: 0,
		liverHeight: 0,
		kidneyHeight: 0,
		diseasesHeight: 0,
		spleenHeight:0,
		isImbibition: false,
		imbibitionTop:750,
		delMask:false,
		delMaskZ:false,
		isSelf:0,

		showDetailInfo:{},
	},
	onLoad: function(options) {
		//缓存页面参数
		wx.setStorageSync('_GET', options);
		var that = this
		that.setData({
			bindid: options.bindid || '',
		})
		if (options.id != undefined && options.DeviceIdentity != undefined) {
			that.setData({
				id: options.id || '',
			
			})
			that.getTreport(options.DeviceIdentity); //获取最新报告 
		} else {
			var treport = wx.getStorageSync('treport');
			if (treport != '' && treport) {
				that.setData({
					treport: treport,
				})
			}
			if (options.type != undefined) {
				that.setData({
					type: parseInt(options.type)
				})
			}

			if (options.DeviceIdentity != undefined) {
				wx.setStorageSync('DeviceIdentity', options.DeviceIdentity);
				wx.setStorageSync('GET_DeviceIdentity', options.DeviceIdentity);
				wx.removeStorageSync('tokenInfo');
				wx.removeStorageSync('treport');

				that.getTreport(options.DeviceIdentity); //获取最新报告 
			}

		}
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			var avatar_url = tokenInfo.avatar_url;
			var nickname = tokenInfo.nickname;
			if ((nickname == undefined && avatar_url == undefined) || (nickname == '' && avatar_url == '') || (!nickname &&
					!avatar_url)) {
				nickname = '未登录';
				avatar_url = 'http://i.2fei2.com/5df32bcad8ab3.png';
			}

			that.setData({
				avatar_url: tokenInfo.avatar_url,
				nickname: tokenInfo.nickname,
				example: options.example || 0,
				isSelf: options.isSelf || 0,
			})

			var DeviceIdentity = wx.getStorageSync('DeviceIdentity');
			if (DeviceIdentity != '' && DeviceIdentity && options.id == undefined) {
				that.getTreport(DeviceIdentity); //获取最新报告 
			}
			
		}); //end 公用设置参数
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	addCart(){
		if(this.data.treport.recommend_sugar_ball.length==0)return
		let self = this
		let ball = []
		Object.values(this.data.treport.recommend_sugar_ball).forEach((item)=>{
			let obj = {
				"buy_num":1,
				"goods_id":item.goods_id,
				"goods_attr_id":item.goods_attr_id
			}
			ball.push(obj)
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/addCart',
			method : 'POST',
			data: {
				user_id: wx.getStorageSync('user_id')||'',
				data: JSON.stringify(ball),
			},
			success: function(ress) {
				if(ress.error==0){
					wx.reLaunch({
						url: "/pageShop/pageShop/car/car?select="+ress.data.cart_id
					})
				}else{
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		})
		
	},
	noop() {},

	/**
	 * 预览图片
	 */
	previewImage: function(e) {
		var current = e.target.dataset.src;
		//预览图片
		wx.previewImage({
			current: current,
			urls: [current],
		});
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
	hideAuthMask(){
		this.setData({
			delMask: false
		})
	},
	showDelMask(){
		this.setData({
			delMask: true
		})
	},
	hideAuthMaskZ(){
		this.setData({
			delMaskZ: false
		})
	},
	showDelMaskZ(){
		this.setData({
			delMaskZ: true
		})
	},
	acceptAuth(){
		let that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/returnTreportBindUser',
			data: {
				treport_id: that.data.treport.db_id,
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id')
			},
			success: function(res) {
				if (res.error == 0 || res.error == 1) {
					wx.showToast({
						title: '退回成功',
						icon: 'none',
						duration: 2000
					});
					wx.removeStorageSync('indexData');
					setTimeout(()=>{
						let pages = getCurrentPages();
						let name = pages.length == 1 ? 'reLaunch':'navigateBack'
						wx[name]({
							url: '/pageWatch/pageWatch/onceLog/onceLog'
						})
					},1000)
				} else {
					app.alert_s(res.msg, that);
				}
			}
		})
	},
	bindscroll(e) {
		if((e.detail.scrollTop > this.data.imbibitionTop)!=this.data.isImbibition){
			this.setData({
				isImbibition: e.detail.scrollTop > this.data.imbibitionTop
			})
		}
	
	},

	isShowMove: function(e) {
		if (this.data.isShowMove == false) {
			this.setData({
				isShowMove: true,
			})
		} else {
			this.setData({
				isShowMove: false,
			})
		}
	},
	/**
	 * 授权用户信息
	 */
	getUserInfo: function(e) {
		var _GET = wx.getStorageSync('_GET');
		var that = this;
		var res = e.detail;

		if (res.errMsg == "getUserInfo:ok") {
			var wecha_id = wx.getStorageSync('wecha_id')
			//缓存微信用户信息
			wx.setStorageSync('wxUserInfo', res.userInfo)
			wx.setStorageSync('encrypted_data', res.encrypted_data)
			wx.setStorageSync('iv', res.iv)

			// 将微信用户信息提交到后台
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Compress/world2xcxIndex/',
				data: {
					encrypted_data: res.encryptedData,
					iv: res.iv,
					session_key: wx.getStorageSync('session_key'),
					shop_id: wx.getStorageSync('watch_shop_id'),
					share_user_id: (_GET.share_user_id == undefined ? wx.getStorageSync('share_user_id') : _GET.share_user_id),
					DeviceIdentity: wx.getStorageSync('DeviceIdentity'),
					to_auth_user_id: wx.getStorageSync('to_auth_user_id'),
					
				},
				method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
				success: function(res2) {
					// 保存request_token信息
					console.log('Wechat/xcxSetUser接口返回：')
					console.log(res2)
					if (res2.msg == 'ok') {
						var tokenInfo = app.getUserInfoInit(res2);
						console.log(tokenInfo);
						//重新载入
						that.onLoad(_GET);
					}
				}
			})
		} else {
			// 授权失败，跳转到其他页面
			wx.reLaunch({
				url: '/pages/msg/msg_fail'
			})
		}
	},
	
	//显示用户登录窗口
	showLogin: function(e) {
		if (!this.data.userInfo) {
			if (this.data.is_auth == 1) {
				this.setData({
					is_auth: 0,
				})
			} else {
				this.setData({
					is_auth: 1,
				})
			}
			return false;
		}
	},

	//用户登录
	clickGetUserInfo: function(res) {
		var that = this;
		app.clickGetUserInfo(res, that, function(tokenInfo) {
			//重新载入
			that.onLoad(wx.getStorageSync('_GET'));
		});
	},
	//绑定报告
	bindTreport: function(e) {
		var that = this;
		var _GET = wx.getStorageSync('_GET');

		if (e.currentTarget.dataset.state == "2") {
			//不绑定
			that.setData({
				isNeedBind: true,
			})
		} else {
			var bind_treport_user_table_id = wx.getStorageSync('this_treport_user').id;
			var treport_id = _GET.id
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Exercise/treportBindUser',
				data: {
					bind_treport_user_table_id: bind_treport_user_table_id,
					treport_id: treport_id,
					user_id: wx.getStorageSync('user_id'),
					shop_id: wx.getStorageSync('watch_shop_id'),
				},
				success: function(res) {
					if (res.error == 0 || res.error == 1) {
						//重新载入
						that.onLoad(_GET);
						that.setData({
							isNeedBind: false,
						})
						app.alert_l('绑定成功，3秒后自动关闭', that, function(argument) {
							// that.onLoad(_GET);
							// 
						});
					} else {
						app.alert_s(res.msg, that);
					}
				}
			})
		}
	},
	//发起扫码
	scanCode: function() {
		var that = this;
		//判断登录状态
		if (!this.data.userInfo) {
			if (this.data.is_auth == 1) {
				this.setData({
					is_auth: 0,
				})
			} else {
				this.setData({
					is_auth: 1,
				})
			}
			return false;
		}

		// 只允许从相机扫码
		wx.scanCode({
			onlyFromCamera: true,
			scanType: ['qrCode'],
			success: (res) => {
				var result = res.result.split(',');
				wx.setStorageSync('DeviceIdentity', result[0]);
				that.getTreport(result[0]);
				// wx.setStorageSync('DeviceIdentity', result[0]);
				// wx.removeStorageSync('tokenInfo');
				// wx.reLaunch({
				//     url: '../index/index'
				// })
			},
			fail: (err) => {
				console.log(err)
			}
		})
	},

	getTreport: function(DeviceIdentity) {
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity
		};
		if (that.data.id != 0) {
			data.id = that.data.id;
		}
		// data.id = 701
		// if (wx.getStorageSync('_GET').is_admin == '1') {
		data.user_id = wx.getStorageSync('user_id');
		data.shop_id = wx.getStorageSync('watch_shop_id') || "";
		data.treport_bind_user_db_id = this.data.bindid || ""
		// }
		
		that.setData({
			isLoading: true
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getTreport',
			data: data,
			success: function(ress) {
				that.setData({
					isLoading: false
				})
				if (ress.error == 0) {
					var treport = ress.data;
					treport.validation = Math.round(treport.validation * 100) / 100;
					treport.examinetime = Math.round(treport.examinetime * 100) / 100;

					treport.old_count_state = parseFloat(treport.old_count_state);
					treport.old_heartmultiscore_lm_state = parseFloat(treport.old_heartmultiscore_lm_state);
					treport.old_livermultiscore_lm_state = parseFloat(treport.old_livermultiscore_lm_state);
					treport.old_sympatheticscore_state = parseFloat(treport.old_sympatheticscore_state);
					treport.grow_sympatheticscore = parseFloat(treport.grow_sympatheticscore);
					treport.grow_livermultiscore_lm = parseFloat(treport.grow_livermultiscore_lm);
					treport.grow_heartmultiscore_lm = parseFloat(treport.grow_heartmultiscore_lm);
					treport.grow_count = parseFloat(treport.grow_count);

					if (that.data.id == 0) {
						wx.setStorageSync('treport', treport);
					}
					treport.startString = util.formatOnlyMonthDay(new Date(treport.starttime*1000),"/") +' '+ util.formatOnlyTimes(new Date(treport.starttime*1000)) 
					treport.endString = util.formatOnlyMonthDay(new Date(treport.endtime*1000),"/") +' '+ util.formatOnlyTimes(new Date(treport.endtime*1000)) 

					treport.addString = util.formatOnlyMonthDay(new Date(treport.add_time*1000),"/") +' '+ util.formatOnlyTimes(new Date(treport.add_time*1000)) 

					treport.count_list = [
						{'name':'count','value':treport.count,'text':'综合得分'},

						{'name':'heart_multi_score','value':treport.heart_multi_score,'text':'心藏'},
						{'name':'spisc','value':treport.spisc,'text':'精神状态'},
						{'name':'cardsc','value':treport.cardsc,'text':'心血管'},

						{'name':'liver_multi_score','value':treport.liver_multi_score,'text':'肝藏'},
						{'name':'autoners','value':treport.autoners,'text':'内脏神经'},
						{'name':'sleepqualiscore','value':treport.sleepqualiscore,'text':'睡眠质量'},
						{'name':'diurnalrhythmscore','value':treport.diurnalrhythmscore,'text':'生命节律'},

						{'name':'kidney_multi_score','value':treport.kidney_multi_score,'text':'肾藏'},
						{'name':'energyscore','value':treport.energyscore,'text':'生命活力'},
						{'name':'sympatheticscore','value':treport.sympatheticscore,'text':'寒热状态'},

						{'name':'bmiscore','value':treport.bmiscore,'text':'体重指数'},
					];
					treport.color_list = {};
					treport.state_image_list = {};
					treport.risk_list = {};

					for(var k in treport.count_list){
						treport.color_list[treport.count_list[k].name] = that.toColor(treport.count_list[k].value);
						treport.state_image_list[treport.count_list[k].name] = that.toStateImage(treport.count_list[k].value);
						if(treport.count_list[k].value <= 60){
							treport.risk_list[k] = treport.count_list[k];
						}
					}

					that.setData({
						treport: treport,
					})
					that.setData({
						recommend_sugar_ball: Object.keys(treport.recommend_sugar_ball).map((item)=>{return item.replace('号','')}).join(','),
					})
					
					//需要绑定报告
					if (wx.getStorageSync('_GET').is_need_bind == "1" && wx.getStorageSync('user_id') != treport.user_id && wx.getStorageSync(
							'user_id') != treport.bind_treport_user_id) {
						that.setData({
							isNeedBind: true,
						})
					} else {
						that.setData({
							isNeedBind: false,
						})
					}

					
				} else {
					app.alert_l(ress.msg, that, function(r) {
						wx.removeStorageSync('DeviceIdentity');
					})
				}
			}
		})
	},

	toColor:function(count){
		
		if(count<=60){
			return 'red';
		}else if(count >= 90){
			return 'blue';

		}else if(count >= 80){
			return 'green';
		}else if(count > 60){
			return 'yellow';
		}
	},
	toStateImage:function(count){
		
		if(count<=60){
			return 'https://i.2fei2.com/poster/slide/2022-04-18/13:58:32/625cfe08ab52a.png';
		}else if(count >= 90){
			return 'https://i.2fei2.com/poster/slide/2022-04-18/13:58:31/625cfe07bd236.png';
		}else if(count >= 80){
			return 'https://i.2fei2.com/poster/slide/2022-04-18/13:58:32/625cfe08d9b52.png';
		}else if(count >= 70){
			return 'https://i.2fei2.com/poster/slide/2022-04-18/13:58:32/625cfe087cb0c.png';
		}
	},
	
	showDetailInfo:function(e){
		var showDetailInfo =this.data.showDetailInfo;
		if(showDetailInfo[e.target.dataset.id]==1){
			//关闭
			showDetailInfo[e.target.dataset.id] = 0;
		}else{
			showDetailInfo[e.target.dataset.id] = 1;
		}
		this.setData({
			showDetailInfo:showDetailInfo,
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageWatch', 'treport2/treport2');
		data.share_true_url = data.share_true_url.replace('pages', 'pageWatch');
		console.log('data', data)
		if ((data.share_true_url.indexOf("&id=") == -1)) {
			data.share_true_url = data.share_true_url + '&id=' + that.data.treport.db_id;
		}
		if ((data.share_true_url.indexOf("&DeviceIdentity=") == -1)) {
			data.share_true_url = data.share_true_url + '&DeviceIdentity=' + that.data.treport.deviceidentity;
		}

		console.log(data.share_true_url);
		return {
			// title: tokenInfo.shareAgencyPoster.share_title,
			// imageUrl: tokenInfo.shareAgencyPoster.share_image_url,
			path: data.share_true_url,
			success: function(res) {
				//添加分享记录
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/User/addShareLog',
					data: data,
					success: function(res) {
						console.log('成功分享记录');
						console.log(res);
					}
				}) //end 分享记录
			}
		}
	}, //end 分享接口
});
