var util = require('../../../utils/util.js')
var app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
		is_need_power:0
	},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
		// 关闭左上角分享按钮
		wx.hideShareMenu()
        if (options.share_user_id != undefined) {
            wx.setStorageSync("share_user_id", options.share_user_id);
        }
        var that = this;
        //公用设置参数
        app.commonInit(options, this, function(tokenInfo) {
                // that.checkMember()
            that.getRoom(options.wechatid);
            that.getClick(options.wechatid)
        });
    },
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
    async checkMember() {
        if (this.data.userInfo.is_need_up_user_pay != 1) {
            let ispay = await app.getMemberInfo();
            app.globalData.memberInfo = ispay;
        } else {
            app.globalData.memberInfo = {
                is_need_up_user_pay: 1
            };
        }
        this.setData({
            isMember: app.globalData.memberInfo.is_need_up_user_pay
        });
    },
    //显示用户登录窗口
    showLogin: function(e) {
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
    },
    //用户登录
    clickGetUserInfo: function(res) {
        var that = this;
        app.clickGetUserInfo(res, that, function(tokenInfo) {
            //重新载入
            that.onLoad(wx.getStorageSync('_GET'));
        });
    },
    getClick(wechatRoomId) {
        var that = this;
        util.ajax({
            url: util.config("baseApiUrl") + "Api/Live/clickRecord",
            data: {
                wechat_anchor_room_id: wechatRoomId,
                shop_id: wx.getStorageSync('watch_shop_id') || '',
            },
            success: function(res) {}
        });
    },
    getRoom(wechatRoomId) {
        var that = this;
        wx.showLoading({ title: '加载中', icon: 'loading' });
        util.ajax({
            url: util.config("baseApiUrl") + "Api/Live/getWechatAnchorRoomInfo",
            data: {
                wechat_anchor_room_id: wechatRoomId,
				user_id: wx.getStorageSync('user_id')
            },
            success: function(res) {
                wx.hideLoading()
                if (res.error == 0) {
                    var list = res.data;
                    list.start_time = util.formatTimes(new Date(res.data.start_time * 1000));
                    list.end_time = util.formatOnlyTimes(new Date(res.data.end_time * 1000));
                    that.setData({
                        room: list,
						is_need_power:res.data.is_need_power
                    });
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: "none",
                        duration: 2000
                    });
                    setTimeout(function() {
                        wx.navigateTo({
                            url: "/pagesTest/live/live"
                        });
                    }, 2000);
                }
            }
        });
    },
    checkUser(e) {
        // let memberInfo = getApp().globalData.memberInfo.is_need_up_user_pay
        // if(memberInfo == 1){
        // 会员
        if (e.target.dataset.type == 1) {
            // 回放
            this.goReplay()
        } else {
            this.goRoom()
        }
        // }else{
        //   // 非会员
        //   wx.redirectTo({
        //     url: "/pages/member/member"
        //   });
        // if(e.target.dataset.type){
        //   // 回放
        //   this.goReplay()
        // }else{
        //   this.goRoom()
        // }
        // }
    },
    goRoom() {
		// 测试身份
		// if(this.data.is_need_power != 0){
		// 	wx.showToast({
		// 	    title: '请联系客服,获取观看权限',
		// 	    icon: "none",
		// 	    duration: 2000
		// 	});
		// 	return
		// }
		if(this.data.room.share_code_url){
			// 乐享
			wx.previewImage({
			  current: 'this.data.room.share_code_url', // 当前显示图片的http链接
			  urls: [this.data.room.share_code_url] // 需要预览的图片http链接列表
			})
		}else{
			let id = wx.getStorageSync('share_user_id') || 0
			let customParams = 'shareId_'+id
			wx.navigateTo({
			    url: "plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=" + this.data.room.roomid+'&custom_params='+customParams
			});
		}
    },
    goReplay() {
        wx.navigateTo({
            url: "/pagesTest/replay/replay?wechatid=" + this.data.room.wechat_anchor_room_id
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    goBack() {
        let pages = getCurrentPages()
        if (pages.length == 1) {
            wx.redirectTo({
                url: "/pagesTest/live/live"
            });
        } else {
            wx.navigateBack()
        }
    },
	// 分享接口
	onShareAppMessage(res) {
		var data = app.shareInit('pageLive', 'room/room');
		data.share_true_url = data.share_true_url.replace('pages', 'pageLive');
		data.share_true_url = data.share_true_url+ "&wechatid=" + this.data.room.wechat_anchor_room_id
		console.log('分享数据：');
		console.log(data.share_true_url);
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/addShareLog',
			data: data,
			success: function(res) {
				console.log('成功分享记录');
				console.log(res);
			}
		})
		return {
			title: '重庆瑜伽医学大会',
			path: data.share_true_url
		}
	},
});