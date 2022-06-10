var util = require('../../../utils/util.js');
var app = getApp();

Page({
	data: {
		topicId:'',
		list:[]
	},
	onLoad: function(options) {
		let that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				topicId: that.data._GET.topicId || "",
			})
			that.getOfficeList()
		}); //end 公用设置参数
	},
	onShow: function() {
	},
	back(e) {
		wx[e.detail]({
			url: '/pageFriend/pageFriend/friendCircle/friendCircle?bigType=1'
		})
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	getOfficeList() {
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Clinic/homeopathySearch',
			data: {
				type:that.data.topicId,
				user_id: wx.getStorageSync('user_id') || '',
				shop_id: wx.getStorageSync('shop_id') || '',
			},
			success: function(ress) {
				if (ress.error == 0) {
					that.setData({
						list: ress.data
					})	
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		})
	},
	onShareAppMessage: function(res) {
		var that = this;
		var data = null
		data = app.shareInit('pageFriend', 'officialDetail/officialDetail');
		data.share_true_url = data.share_true_url.replace('pages', 'pageFriend')
		console.log('分享数据：');
		console.log(data.share_true_url);
		return {
			title: '',
			path: data.share_true_url
		}
	}, //end 分享接口
})
