var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config');
Page({
	data: {
		id:'',
		userId:'',
		info:{},
		dynamicInfo:{}
	},
	onLoad: function(options) {
		let that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				dId:that.data._GET.dId || "",
				type:options.type || "",
			})
			that.getDetail()
		}); //end 公用设置参数
	},
	onShow: function() {
	},
	back() {
		let pages = getCurrentPages();
		let name = pages.length == 1 ? 'reLaunch':'navigateBack'
		wx[name]({
			url: '/pageFriend/pageFriend/friendCircle/friendCircle?bigType=1'
		});
		
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	
	getDetail() {
		var that = this;
		that.setData({
			loading: true
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/getUserDynamicInfo',
			data: {
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				user_dynamic_id: that.data.dId || "",
				click_user_id:wx.getStorageSync('user_id') || ''
			},
			success: function(ress) {
				that.setData({
					loading: false
				})
				if (ress.error == 0) {
					// let data = ress.data.map((item)=>{
					// 	item.time = util.formatTimes(new Date(item.add_time*1000))
					// 	return item
					// })
					// let list = that.data.page_no == 1 ? data : that.list.concat(data);
					ress.data.info.timeCircle = util.formatTimeState(ress.data.info.add_time)
					ress.data.info.timeOnlyTimes = util.formatOnlyTimes(new Date(ress.data.info.add_time * 1000))
					ress.data.info.starttime_text = util.formatTimes(new Date(ress.data.info.add_time * 1000))
					that.setData({
						dynamicInfo: ress.data,
					})
				} else {
					wx.showToast({
						title:ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			},
			error(){
				that.setData({
					loading: false
				})
			}
		})
	},
	
	onShareAppMessage: function(res) {
		var that = this;
		var data = null
		data = app.shareInit('pageFriend', 'dynamicDetail/dynamicDetail');
		data.share_true_url = data.share_true_url.replace('pages', 'pageFriend')
		let arr = (res.target && res.target.id && res.target.id.split('_')) || []
		if ( arr[0]== "share") {
			let list = that.data.dynamicInfo
			let index = arr[2]
			list.info.share_num = list.info.share_num*1 + 1
			that.setData({
				dynamicInfo:list
			})
			
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/addShareLog',
				data: {
					shop_id: wx.getStorageSync('watch_shop_id'),
					user_id: wx.getStorageSync('user_id'),
					share_url: "/pageFriend/pageFriend/dynamicDetail/dynamicDetail",
					module:"pageFriend",
					controller:"pageFriend",
					action:"dynamicDetail",
					share_type:1, //1:朋友,2:朋友圈,3:qq,4:微博
					user_dynamic_id: that.data.dId || "",
					// page_no: that.data.page_no,
					// page_num: that.data.page_num,
				},
				success: function(ress) {
				}
			})
		}
		
		console.log('分享数据：');
		console.log(data.share_true_url);
		return {
			title: config.config().title||'',
			path: data.share_true_url
		}
	}, //end 分享接口
})
