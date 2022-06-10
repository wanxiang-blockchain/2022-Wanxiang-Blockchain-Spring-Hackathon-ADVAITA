import * as echarts from '../../../utils/ec-canvas/echarts';
var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config.js');
const skinBehavior = require('../../../utils/skinBehavior.js');

var setOptions = require('../../../utils/setOptions.js');
var chartBPM = null
var chartBP = null
var chartOXY = null
var chartHRV = null
Page({
	behaviors: [skinBehavior],
	data: {

		URL: 5,
		nickname: '',
		avatar_url: '',
		treport: false,
		//展开隐藏
		isShowCorrect: false,
		showSwitchUser: false,
		showSwitchUserTopStyle: -1000,
		pageHR: 1, //心率页数
		pageBP: 1, //血压页数
		scoreDataT: [],
		scoreLoading: false,
		hrvData: [],
		hrvLoading: false,
		tipMask: false,
		showValidMask: false,
		userid_active: 0,
		this_treport_user: {},
		addUserMask: false,
		authMask: false,
		reportErr: false,
		isFirst: true,
		friendMask: false,
		triggleChart:true,
    is_auth:0,
    treport_page_no:1,

    //图表📈
    ecBP: {
			disableTouch: true,
			lazyLoad: true
		},
		ecBPM: {
			disableTouch: true,
			lazyLoad: true
		},
		ecHRV: {
			disableTouch: true,
			lazyLoad: true
		},
		ecOXY: {
			disableTouch: true,
			lazyLoad: true
		},
		isShowXL: true,
		isShowBP: true,
		isShowOXY: true,
		todayDate: '',
		initDate:'',
		bpmData: [],
		hrvData: [],
		systolicData: [],
		diastoliData: [],
		oxygenData: [],
		bpmLoading: false,
		hrvLoading: false,
    bpLoading: false,
    
    //蓝牙
    switchChecked: 0,
    addWifiPage:0,
    name: 'OMSAT',
    uuid: '9C2C4841-69C3-4742-9F69-764351FB0783',
    write: '9C2C48A5-69C3-4742-9F69-764351FB0783',
    notify: '9C2C485A-69C3-4742-9F69-764351FB0783',
    deviceId: '',
    imei: '',

    //表单
    isPass: 1,
    acc: '',
    pass: '',
    sexArr: ['男', '女'],
    yesOrNo: ['无', '有'],
    checkex: [],
  },
  onReady() {
		// 获取组件
		this.ecBPMComponent = this.selectComponent('#mychart-dom-bpm');
    this.ecBPComponent = this.selectComponent('#mychart-dom-bp');
    
    console.log(this.ecBPComponent);
		// this.ecLineComponent = this.selectComponent('#mychart-dom-line');
		// this.ecOXYComponent = this.selectComponent('#mychart-dom-oxy');
	},
	onUnload:function(){
		chartBPM = null
		chartBP = null
		chartOXY = null
		chartHRV = null
	},
	onLoad: function(options) {
		//清除缓存
		if (options.c == '1' || options.c == 1) {
			wx.clearStorageSync();
			wx.removeStorageSync('is_need_register');
			wx.removeStorageSync('tokenInfo');
			wx.removeStorageSync('world2xcxIndexPage');
			wx.removeStorageSync('goodsNewActivity');
			wx.removeStorageSync('code');
			wx.removeStorageSync('session_key');
			wx.removeStorageSync('hzxcxIndexPage');
			wx.removeStorageSync('goodsNewActivity');
			wx.removeStorageSync('session_key');
			wx.removeStorageSync('to_auth_user_id');
		}

		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		var that = this
		wx.getSystemInfo({
			success: (res) => {
				that.setData({
					windowHeight: res.windowHeight,
					windowWidth: res.windowWidth,
					showSwitchUserTopStyle: -res.windowHeight
				})
			}
		})
		if (wx.getStorageSync('GET_DeviceIdentity')) {
			wx.removeStorageSync('treport');
			wx.removeStorageSync('DeviceIdentity');
			wx.removeStorageSync('GET_DeviceIdentity');
		}

		var treport = wx.getStorageSync('treport');
		var step = 2;
		if (treport != '' && treport) {
			that.setData({
				treport: treport,
			})
		}
		
		// 获取组件
		// this.ecScoreComponent = this.selectComponent('#mychart-dom-score');

		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				user_id:wx.getStorageSync('user_id'),
				nickname: that.data.userInfo && that.data.userInfo.Wechat_xcxSetUser && (that.data.userInfo.Wechat_xcxSetUser.nickname || that.data.userInfo.Wechat_xcxSetUser.channel_name || ''),
				avatar_url: that.data.userInfo && that.data.userInfo.Wechat_xcxSetUser && (that.data.userInfo.Wechat_xcxSetUser.avatar_url || ''),
        headerTitle:config.config().title||'',



				todayDate: util.formatOnlyDates(new Date()),
				initDate: new Date().getTime()
      })
			setTimeout((item) => {
				that.setData({
					isFirst: false
        })
        
      }, 1000)
      

			if(that.data.userInfo){
        that.refreshData();
        
      }
      

		}); //end 公用设置参数
	},
	onShow() {
		
		if (!this.data.isFirst) {
			this.refreshData();
    }

    wx.getSystemInfo({
			success: (res) => {
				this.setData({
					windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
				})
			}
		})

    this.onBluetooth();
  },
  //开始搜索附近的蓝牙设备
onBluetooth: function (e) {
  var that = this;
  var ok = 0;
  wx.getConnectedBluetoothDevices({
    services: [that.data.uuid],
    success: function (res) {
      console.log(res)
      for(var k in res.devices){

        if(res.devices[k]==that.data.name){
          //已经连上了
          that.setData({
            switchChecked: 1,
            deviceId: res.devices[k].deviceId
          })
          that.begin();
          ok = 1;
          break;
        }
      }
    }
  })
  if(ok!=1){
    that.setData({
      switchChecked: 0
    });
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log(res)
        that.onBluetoothAdapterStateChange(); //监听蓝牙适配器状态变化事件
        that.getBluetoothAdapterState();
        //监听低功耗蓝牙连接状态的改变事件，包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
        wx.onBLEConnectionStateChange(function (res) {
          // 该方法回调中可以用于处理连接意外断开等异常情况
          console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
          // wx.setStorageSync('bluetoothData','');
          // wx.setStorageSync('bluetoothDataCourse','');

          //实时上传断开重连
          if (res.connected == false) {
            that.autoLink(res.deviceId);
            wx.showToast({
              title: '断开蓝牙',
              icon: 'success',
            })
            that.setData({
              switchChecked: 2,
            });
          }
        })
        // that.setData({
        //     switchChecked: 1
        // });
      },
      fail: function (err) {
        that.setData({
          switchChecked: 2
        });
        console.log(err);
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '初始化蓝牙失败，请检查是否开启蓝牙设备',
        })
      }
    })
  }

},

//断开自动重连
autoLink: function(deviceid) {
var that = this;
var op = { currentTarget: { dataset: { deviceid: deviceid } } };
wx.createBLEConnection({
  deviceId: op.currentTarget.dataset.deviceid,
  success: function (res) {
    console.log(res);

    wx.showToast({
      title: '重连成功',
      icon: 'success',
    })
    //获取蓝牙设备所有服务
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: op.currentTarget.dataset.deviceid,
      success: function (res) {
        console.log('device services:', res.services)
        // that.beginReturn(op);//开始实时上传
        that.begin();//开始实时上传
      }
    })
  },
})
},
//关闭蓝牙模块--断开与低功耗蓝牙设备的连接
offBluetooth: function(e) {

var that = this;
wx.closeBluetoothAdapter({
  success: function (res) {
    console.log("关闭蓝牙模块")
    console.log(res)
    that.setData({
      addWifiPage: 0,
      switchChecked:2
    });
  }
})
},
//监听蓝牙适配器状态变化事件
onBluetoothAdapterStateChange: function() {
wx.onBluetoothAdapterStateChange(function (res) {
  console.log(`adapterState changed, now is`, res)
  var available = res.available;
  if (!available) {
    that.setData({
      switchChecked: 2
    });
    wx.showToast({
      icon: 'error',
      duration: 2000,
      title: '蓝牙已断开',
    })
  }
})
},
//获取本机蓝牙适配器状态
getBluetoothAdapterState: function() {
var that = this;
wx.getBluetoothAdapterState({
  success: function (res) {
    console.log(res)
    var available = res.available; //蓝牙适配器是否可用
    var discovering = res.discovering; //是否正在搜索设备

    if (!discovering) {
      that.startBluetoothDevicesDiscovery();
    }
  }
})
},
//开始搜寻附近的蓝牙外围设备。注意，该操作比较耗费系统资源，请在搜索并连接到设备后调用 stop 方法停止搜索。
startBluetoothDevicesDiscovery: function() {
var that = this;
wx.startBluetoothDevicesDiscovery({
  // services: [],
  success: function (res) {
    console.log(res)
    if (res.isDiscovering) {
      console.log("开始搜索设备：")
      that.getBluetoothDevices();
    }
  },
  fail: function (err) {
    console.log(err);
    wx.showToast({
      icon: 'none',
      duration: 2000,
      title: '搜寻附近的蓝牙外围设备失败',
    })
  }
})
},
//获取所有已发现的蓝牙设备  
getBluetoothDevices: function() {
var that = this;
var length = 0;
var count = 0;
// wx.showLoading({
//     title: '加载中',
//     mask: true
// })
var deviceslist = [];
setTimeout(function () {
  wx.getBluetoothDevices({
    success: function (res) {
      console.log(res)
      deviceslist = res.devices
      that.createBLEConnection(deviceslist);//自动连接蓝牙
      // that.setData({
      //     list: deviceslist
      // });
    },
  })
  wx.hideLoading()
}, 5000) //搜寻设备5秒

},

//自动连接低功耗蓝牙设备  
createBLEConnection: function(deviceslist) {
console.log('deviceslist', deviceslist);
var that = this;
for (var k in deviceslist) {
  if (deviceslist[k].name == that.data.name) {

    wx.createBLEConnection({
      deviceId: deviceslist[k].deviceId,
      success: function (res) {
        wx.getBLEMTU({
          deviceId: deviceslist[k].deviceId,
          writeType: 'write',
          success(res) {
            console.log('getBLEMTU', res)
          }
        })
        setTimeout(function () {
          that.begin()
        }, 1000) //延迟时间 这里是1秒  

        console.log('这里有可能有IMEI', res);
        //获取蓝牙设备所有服务
        wx.getBLEDeviceServices({
          // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
          deviceId: deviceslist[k].deviceId,
          success: function (res) {
            console.log('device services:', res.services)
            that.setData({
              switchChecked: 1,
              // uuid:res.services[0].uuid,
              deviceId: deviceslist[k].deviceId,
            });
            // that.setData({
            //     ServiceConnected: res.services,
            //     ServiceDisplay: "block"
            // });
          }
        })

      },
      fail: function (err) {
        console.log('连接失败', err);
        that.setData({
          switchChecked: 2
        });
        wx.showToast({
          icon: 'error',
          duration: 2000,
          title: '连接失败',
        })
      },
    })
    return;
  }
}
wx.showToast({
  icon: 'none',
  duration: 3000,
  title: '没有找到OMSAT蓝牙',
})
that.setData({
  switchChecked: 2
});
this.offBluetooth();

},


//向低功耗蓝牙设备特征值中写入二进制数据
writeBLECharacteristicValue: function(cmd, hex) {
var that = this;
// var hex = ''
var new_hex = 'A6' + cmd + that.data.imei.toUpperCase() + hex + util.chk8xor('A6' + cmd.toUpperCase() + hex.toUpperCase()) + '66';

that.setData({
  log: 'imei:' + that.data.imei.toUpperCase() + 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';write:' + that.data.write + ';hex:' + new_hex + '校验:' + util.chk8xor('A6' + cmd.toUpperCase() + hex.toUpperCase()) + '命令字:' + cmd + '数据段:' + hex,
})

//样机测试
// new_hex = 'A5098002000000';

var buffer1 = util.hex2ab(new_hex);


// console.log(buffer1)
wx.writeBLECharacteristicValue({
  deviceId: that.data.deviceId,
  serviceId: that.data.uuid,
  characteristicId: that.data.write,
  value: buffer1,
  success: function (res) {
    // success
    console.log("success：" + util.ab2hex(buffer1) + "指令发送成功");
    // console.log(res);
    wx.showToast({
      icon: 'none',
      duration: 2000,
      title: 'ok:' + util.ab2hex(buffer1),
    })
  },
  fail: function (res) {
    // fail
    console.log(res);
    wx.showToast({
      icon: 'none',
      duration: 2000,
      title: '指令发送失败：' + res.errMsg,
    })
  },
  complete: function (res) {
    // complete
  }
})
},
//启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值[注意：必须设备的特征值支持notify或者indicate才可以成功调用]
notifyBLECharacteristicValueChange: function() {
var that = this;
//监听低功耗蓝牙连接状态的改变事件，包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
wx.onBLEConnectionStateChange(function (res) {
  // 该方法回调中可以用于处理连接意外断开等异常情况
  console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
})

// 必须在这里的回调才能获取
wx.onBLECharacteristicValueChange(function (res) {
  console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
  var val = util.ab2hex(res.value).toUpperCase();
  // console.log('接:'+val);


  // wx.setStorageSync('bluetoothData',wx.getStorageSync('bluetoothData')+val);
  that.setData({
    log: new Date() + '接收：' + wx.getStorageSync('bluetoothData')
  })

  //检查帧头，是否完整数据
  that.realData(val);//wx.getStorageSync('bluetoothData'));//应答解析
})

wx.notifyBLECharacteristicValueChange({
  state: true, // 启用 notify 功能
  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
  deviceId: that.data.deviceId,
  // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
  serviceId: that.data.uuid,
  // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
  characteristicId: that.data.notify,
  success: function (res) {
    console.log('notifyBLECharacteristicValueChange success', res.errMsg)
  }
})
},
	async getUserProfile(e) {
		app.getUserProfile(this);
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/personal/personal'
		})
	},
	showFriendMask() {
		this.setData({
			friendMask: true
		})
	},
	showtips(e) {
		this.setData({
			showValidMask: true
		})
	},
	cancel() {
		this.setData({
			tipMask: false,
			showValidMask: false
		})
	},
	openTips() {
		this.setData({
			tipMask: true
		})
	},
	showSwitchUser: function(e) {
		// 我的手表
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
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo');
		if (!that.data.userid_active) {
			wx.showToast({
				title: '请选择或新建一个用户',
				icon: 'none',
				duration: 2000
			});
			return
		}
		this.setData({
			triggleChart:false,
			info:{}
		})
		wx.setStorageSync('userDetail', that.data.default_treport_user)
		wx.navigateTo({
			url: "/pageWatch/pageWatch/watchesList/watchesList"
		})
	},
	goChat(){
		wx.previewImage({
		   current: 'https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png',
		   urls: ['https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png']
    })
  },
  linkWifi(){
    if(this.data.switchChecked!=1){
      wx.showToast({
        title: '请先连接蓝牙',
        icon: 'none',
        duration: 2000
      });
      this.onBluetooth();
      return false;
    }
    var that = this;
    this.setData({
      addWifiPage: 1,
  
    })
  
  
  
    if (that.data.isIos) {
      that.setData({
        wifiList: [],
        isShowWifiList: 0,
      })
  
    } else {
      that.setData({
        isShowWifiList: 1,
        wifiList: []
      })
      wx.showLoading({
        title: '搜索WiFi中',
      })
      wx.startWifi({
        success(res1) {
          console.log(res1);
          wx.getWifiList({
            success(res2) {
              console.log(res2);
              wx.onGetWifiList((result) => {
                console.log(result);
                wx.hideLoading();
                that.setData({
                  wifiList: result.wifiList.filter((item) => {
                    return item.SSID && item.secure
                  })
                })
              })
            },
            fail(res) {
              console.log(res);
              app.alert_s(res.errMsg, that);
              wx.hideLoading();
            }
          })
        },
        fail(res) {
          console.log(res);
          app.alert_s(res.errMsg, that);
          wx.hideLoading();
        }
      })
    }
  },
  selectWifi(e){
    this.setData({
      acc: e.currentTarget.dataset.name,
      isShowWifiList: 0,
    })
  },
  goRealTimeChart(e){
    console.log(e)
    // this.offBluetooth();
    wx.navigateTo({
      url: '/pageWatch/pageWatch/realTimeChart/realTimeChart?device_id=' + this.data.imei,
    });
  
  },
  
  bindFormChange: function(e) {
    // console.log( e)
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var addData = {};
    addData[e.target.dataset.key] = e.detail.value;
    // console.log(addData)
    this.setData(addData)
    this.checkNext();
  },
  
  otherChange: function(e) {
    // console.log(e)
  
    var checkex = this.data.checkex;
  
    if (e.currentTarget.dataset.index == 0) {
      checkex = [checkex[0]]
    } else {
      checkex[0] = '';
    }
    if (checkex[e.currentTarget.dataset.index] == e.currentTarget.dataset.text) {
      checkex[e.currentTarget.dataset.index] = '';
    } else {
      checkex[e.currentTarget.dataset.index] = e.currentTarget.dataset.text;
    }
  
    var otherbing = '';
    for (var k in checkex) {
      if (checkex[k] != '') {
        otherbing = otherbing + checkex[k] + ',';
      }
    }
    if (otherbing == '') {
      checkex = [];
    }
  
    this.setData({ checkex: checkex, otherbing: otherbing });
    this.checkNext();
  },
  
  //确认下一步
  checkNext: function() {
    if (this.data.sex != undefined && this.data.birth != undefined && this.data.cm != undefined && this.data.kg != undefined) {
      this.setData({
        check: 1,
      })
    } else {
      this.setData({
        check: 0,
      })
    }
  
    if (this.data.gaoxueya != undefined && this.data.tangniaobing != undefined && this.data.guanxinbing != undefined && this.data.checkex != undefined && this.data.checkex.length > 0) {
      this.setData({
        check: 2,
      })
    }
  },
  //下一步
  confirm2: function() {
    if (this.data.check == 1) {
      this.setData({
        switchChecked: 4,
        addWifiPage: 3,
        check: 0,
      })
    }
  },
  //提交信息
  confirm3: function() {
    if (this.data.check != 2) {
      return false;
    }
    var that = this;
    this.setData({
      check: 3,
    })
  
    util.ajax({
      url: util.config('baseApiUrl') + 'Api/Exercise/updateTreportUser',
      data: {
        user_id: wx.getStorageSync('user_id'),
        shop_id: 25,
        sex: parseInt(parseInt(that.data.sex) + 1),
        weight: that.data.kg,
        height: that.data.cm,
        birth_day: that.data.birth,
        gaoxueya: that.data.gaoxueya,
        tangniaobing: that.data.tangniaobing,
        guanxinbing: that.data.guanxinbing,
        otherbing: that.data.otherbing,
      },
      success: function (res) {
        if (res.error == 0) {
          wx.showToast({
            title: '保存成功',
            icon: 'none',
            duration: 2000
          });
          //跳转页面
          setTimeout(function () {
            wx.redirectTo({
              url: '/pages/index/index',
            })
          }, 2000)
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          });
        }
      },
      complete: function () {
        this.setData({
          check: 2,
        })
      }
    })
  
  },
	goUrl(e) {
		if (this.data.userInfo && this.data.userInfo.Wechat_xcxSetUser) {
			let url = e.target.dataset.url || e.currentTarget.dataset.url
			if(!url){
				// wx.showToast({
				// 	title: '暂未开放',
				// 	icon: 'none',
				// 	duration: 2000
				// });
				return
			}
			wx.navigateTo({
				url: url
			})
		} else {
			this.showLogin()
		}
	},
	toUrl(e) {
		if (e.currentTarget.dataset.login == "true") {
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
		}
		wx.navigateTo({ url: e.currentTarget.dataset.url });
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
				url: '../msg/msg_fail'
			})
		}
	},
	//显示用户登录窗口
	showLogin: function(e) {
		this.setData({
			is_auth: 1
		})
		
		// if (!this.data.userInfo) {
		// 	if (this.data.is_auth == 1) {
		// 		this.setData({
		// 			is_auth: 0,
		// 		})
		// 	} else {
		// 		this.setData({
		// 			is_auth: 1,
		// 		})
		// 	}
		// 	return false;
		// }
	},
	/*授权模版消息*/
	isOpenMessage: function(e) {
		var that = this;
		if (e.currentTarget.dataset.state == 1) {
			//同意
			app.openMessage();
		} else {
			//拒绝
			that.setData({
				isShowJoinStaff: false
			})
		}
		that.setData({
			isOpenMessage: false
		})
	},
	//打开模版消息
	openMessage: function(e) {
		let showMask = e.currentTarget.dataset.showmask == 1
		app.openMessage(showMask);
	},
	//用户登录
	clickGetUserInfo: function(res) {
		var that = this;
		app.clickGetUserInfo(res, that, function(tokenInfo) {
			//重新载入
			that.onLoad(wx.getStorageSync('_GET'));
			// 模版消息授权
			// that.setData({
			// 	isOpenMessage: true
			// })
		});
	},
	//发起扫码
	scanCode: function() {
		var that = this;
		wx.removeStorageSync('indexData');
		wx.navigateTo({
			url: '/pages/scanWatch/scanWatch'
		});
	},
	closeLogin(){
		this.setData({
			is_auth:0
		})
	},
	changeErr() {
		this.refreshData('', 'noRefresh')
	},
	setIndexInfo(ress, device_id) {
		let that = this;
		let analyzeRes = []
		let hasAnalyze = false
		let analyzeTime = ''
		if(ress.data.analyze instanceof Array){
			// 未满足5份
			hasAnalyze = false
		}else{
			let analyze = Object.values(ress.data.analyze.count).filter((item)=>{
				return item.is_select == 1
			})
			if(analyze.length>0){
				function changeArr(data,type){
					let arr = Object.values(data)
					let list = arr.map((item)=>{
						item.color = type
						item.line_name = item.line_name.replace('的指标','')
						switch (item.line) {
							case 'heart_multi_score':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=heart'	
								break
							case 'spiritscore':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=XAR'	
								break
							case 'spisc':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=SPISC'	
								break
							
							case 'sleepqualiscore':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=XST'	
								break
							case 'diurnalrhythmscore':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=XASRD'	
								break
							case 'cardiovascularscore':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=XBAR'	
								break
							case 'liver_multi_score':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=liver'	
								break
							case 'kidneygasificationscore':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=GSA'	
								break
							case 'kidney_multi_score':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=kidney'	
								break
							case 'energyscore':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=SVL'	
								break
								case 'sympatheticscore':
									item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=SMR'	
									break
							case 'gbr':
							case 'gar':
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local=GBRGAR'	
								break
							default:
								item.lineUrl = '/pageWatch/pageWatch/quota/quota?local='+item.line.toUpperCase()
						}	
						
						if(item.row_detail.length>0){
							item.row_detail = Object.values(item.row_detail).map((obj)=>{
								obj.time = util.formatOnlyDates(new Date(obj.endtime*1000),'.')
								return obj
							})
						}
						return item
					})
					return list
				}
				analyzeRes = changeArr(analyze[0].hole3_line,'#FF0000').concat(changeArr(analyze[0].hole2_line,'#F7B500'))
				analyzeRes = analyzeRes.concat(changeArr(analyze[0].hole1_line,'#6D7278'))
			}
			analyzeTime = util.formatOnlyMonthDay(new Date(ress.data.analyze.start_time*1000),'月')+'日-'+util.formatOnlyMonthDay(new Date(ress.data.analyze.end_time*1000),'月')+'日'
			hasAnalyze = true
    }
    ress.data.surplus_time_second_percent = parseInt(100-ress.data.surplus_time_second/86400 * 100);
    ress.data.surplus_time_second_percent = ress.data.surplus_time_second_percent>100? 100 : ress.data.surplus_time_second_percent;
		ress.data.surplus_time_second_text = parseInt(ress.data.surplus_time_second/60/60)+'小时'+(ress.data.surplus_time_second/60/60).toFixed(2).split('.').slice(-1)+'分';
		that.setData({
			info: ress.data,
			analyze:analyzeRes,
			hasAnalyze:hasAnalyze,
			analyzeTime:analyzeTime,
			analyzeText:ress.data.analyze.text,
			analyzeState:ress.data.analyze.state,
		})
	},
	//获取心率变异性
	validData(device_id) {
		let info = wx.getStorageSync('indexData') || {};
		if (info.data && (info.saveTime + 1000 * 60 * 3 >= new Date().getTime())) {
			this.setIndexInfo(info, device_id)
			return
		}
		var that = this;
		var data = {
			DeviceIdentity: device_id || "",
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/validData',
			data: data,
			success: function(ress) {
				that.setData({
					hrvLoading: false
				})
				if (ress.error == 0) {
					
          ress.saveTime = new Date().getTime()
					wx.setStorageSync('indexData', ress);
					that.setIndexInfo(ress, device_id)
				}
			},
			error(ress) {
				that.setData({
					hrvLoading: false
				})
				wx.showToast({
					title: ress.msg,
					icon: 'none',
					duration: 2000
				});
			}
		})
	},
	refreshData(device_id, type) {
		if(!this.data.user_id)return
		this.setData({
			triggleChart: true,
			info:{}
		})
		this.indexInfo(device_id, type);
	},
	indexInfo(device_id, type) {
		this.setData({
			hrvLoading: true,
		})
		var that = this;
		var data = {
			DeviceIdentity: device_id || '',
			user_id: wx.getStorageSync('user_id') || '',
			shop_id: wx.getStorageSync('watch_shop_id') || '',
			bind_treport_user_table_id: that.data.userid_active || '',
			share_user_id: that.data._GET.share_user_id || '',
			treport_page_no: that.data.treport_page_no || ''
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Compress/world2xcxIndexReal',
			data: data,
			success: function(ress) {
				that.setData({
					hrvLoading: false
				})
				if (ress.error == 0) {
					// 显示邀请 invite==1 ID不是本人 没有人接受 本次没有拒绝
					that.setData({
						banner2:ress.data.banner2,
						HRNum: ress.data.getHR.list.length > 0 ? ress.data.getHR.list[0].val : 0,
						this_treport_user: ress.data.default_watches ? ress.data.default_watches : {},
						userid_active: ress.data.default_treport_user_table_id,
						reportErr: false,
						default_treport_user:ress.data.default_treport_user,
						nickname: ress.data.default_treport_user.name || ress.data.default_treport_user.wechat_name || '',
						avatar_url: ress.data.default_treport_user.avatar_url || '',
            treport_diary_text:ress.data.treport_diary_text,
            treport_num:ress.data.treport_num,
					})
					wx.setStorageSync('this_treport_user', ress.data.default_watches ? ress.data.default_watches : {});
					wx.setStorageSync('DeviceIdentity', ress.data.default_watches.device_id)
					wx.setStorageSync('currentUserId', ress.data.default_treport_user_table_id)

          // 首页信息赋值
          var device_id = ress.data.default_watches.device_id;
					that.getTreportInfo(device_id, '', ress.data.getTreport)
          that.validData(device_id)
          
          that.getHR(device_id); //获取心率
          that.getBP(device_id); //获取血压
          // that.getHRV(device_id); //获取心率变异性

				} else {
					that.setData({
						HRNum: '0',
						this_treport_user: {},
						userid_active: that.data.userid_active || 0,
						reportErr: true,
						default_treport_user:{}
					})
					app.alert_s(ress.msg, that);
				}
			},
			error() {
				that.setData({
					hrvLoading: false,
					HRNum: '0',
					this_treport_user: {},
					userid_active: that.data.userid_active || 0,
					reportErr: true,
					default_treport_user:{}
				})
			}
		})
	},
	gobubbleUrl(e) {
		// if (!this.data.userInfo) {
		// 	this.setData({
		// 		isLogin: 1
		// 	})
		// 	return
		// }
	
		let url = e.detail
		if (url) {
			if (url.indexOf('http') < 0) {
				wx.navigateTo({
					url: url
				})
			} else {
				let id = wx.getStorageSync('user_id') || 0
				wx.navigateTo({
					url: "/pages/focus/focus?url=" + url + '/user_id/' + id,
				});
			}
		}
	
	
  },
  //血压校准
  calibration: function(systolic,diastolic) {
    var that = this;
  
    var hex = util.fillZero(parseInt(systolic).toString(16), 2) + util.fillZero(parseInt(diastolic).toString(16), 2);
    console.log(hex)
    
    var return_text =  '';
    //获取蓝牙特征值
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.uuid,
      success: function (res) {
        console.log('device getBLEDeviceCharacteristics:', res.characteristics)
  
        that.setData({
          log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
        })
  
        // that.begin(that.data.deviceId);//蓝牙开始工作
  
        // that.setData({
        //     CharacteristicConnected: res.characteristics,
        // })
        that.notifyBLECharacteristicValueChange();//监听
        that.writeBLECharacteristicValue('E0', hex);//写入
        
        return_text = '血压校准成功';
      },
      fail: function (res) {
        // fail
        console.log('getBLEDeviceCharacteristics:fail');
        console.log(res);
        return_text = '血压校准失败';

      },
    })
    return return_text;
  },
	//校准血压
	correctBP: function(e) {
    
		var that = this;
		var data = {
			DeviceIdentity: wx.getStorageSync('DeviceIdentity') || '',
			treport_user_table_id: wx.getStorageSync('currentUserId') || '',
			user_id: wx.getStorageSync('user_id') || '',
			shop_id: wx.getStorageSync('watch_shop_id') || '',
			diastoli: e.detail.value.diastoli,
			systolic: e.detail.value.systolic,
		}
		this.setData({
			isShowCorrect: false
    })
    
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/correctBP',
			data: data,
			success: function(ress) {
				if (ress.error == 0) {
          var default_treport_user = that.data.default_treport_user;
          default_treport_user.diastoli = data.diastoli;
          default_treport_user.systolic = data.systolic;
          that.setData({
            default_treport_user:default_treport_user
          })
          
					app.alert_s(this.calibration(), that);
				} else {
					app.alert_s(ress.msg, that);

				}
			}
		})

  },
  
  upload_tipMask: function(e) {
		if (this.data.upload_tipMask == false) {
			this.setData({
				upload_tipMask: true,
			})
		} else {
			this.setData({
				upload_tipMask: false,
			})
		}
	},
	isShowCorrect: function(e) {
		if (this.data.isShowCorrect == false) {
      console.log()
      if(this.data.switchChecked!=1 && this.data.this_treport_user.era>=3){
        wx.showToast({
          title: '请先连接蓝牙',
          icon: 'none',
          duration: 2000
        });
        this.onBluetooth();
        return false;
      }
			this.setData({
				isShowCorrect: true,
			})
		} else {
			this.setData({
				isShowCorrect: false,
			})
		}
	},
	getTreportInfo: function(DeviceIdentity, treport_id, res) {
		var that = this;
		if (res && res.deviceidentity) {
			var treport = res;
			
			treport.countColor = util.colorRule(treport.count)
			treport.old_count_state = parseFloat(treport.old_count_state);
			treport.old_heartmultiscore_lm_state = parseFloat(treport.old_heartmultiscore_lm_state);
			treport.old_livermultiscore_lm_state = parseFloat(treport.old_livermultiscore_lm_state);
			treport.old_sympatheticscore_state = parseFloat(treport.old_sympatheticscore_state);
			treport.grow_sympatheticscore = parseFloat(treport.grow_sympatheticscore);
			treport.grow_livermultiscore_lm = parseFloat(treport.grow_livermultiscore_lm);
			treport.grow_heartmultiscore_lm = parseFloat(treport.grow_heartmultiscore_lm);
			treport.grow_count = parseFloat(treport.grow_count);
			treport.grow_heartmultiscore_lm_len = (treport.grow_heartmultiscore_lm == 0 ? 0 : (treport.grow_heartmultiscore_lm >=
				10 ? 2 : 1));
			treport.grow_livermultiscore_lm_len = (treport.grow_livermultiscore_lm == 0 ? 0 : (treport.grow_livermultiscore_lm >=
				10 ? 2 : 1));
			treport.grow_sympatheticscore_len = (treport.grow_sympatheticscore == 0 ? 0 : (treport.grow_sympatheticscore >=
				10 ? 2 : 1));
			treport.grow_count_len = (treport.grow_count == 0 ? 0 : (treport.grow_count >= 10 ? 2 : 1));
			treport.creatTimeString = util.formatOnlyDates(new Date(treport.add_time*1000))
			wx.setStorageSync('treport', treport);
			that.setData({
				treport: treport,
			})

		} else if (res == 'NEED_WAIT') {
			// 报告生成中
			wx.removeStorageSync('treport');
			that.setData({
				treport: {},
			})
		} else {
			that.setData({
				treport: {},
			})
			// app.alert_l('报告生成错误')
		}

  },
  treportPageNo:function(e){
    console.log(e)
    var treport_page_no = parseInt(this.data.treport_page_no);
    
    if(e.currentTarget.dataset.type==1){
      treport_page_no=treport_page_no+1;
    }else{
      treport_page_no=treport_page_no-1;
    }
    if(treport_page_no<=0){
      treport_page_no = 1;
    }
    if(treport_page_no>this.data.treport_num){
      return false;
    }
    this.setData({
      treport_page_no:treport_page_no,
    })
    this.indexInfo(this.data.this_treport_user.device_id);
  },

  //获取血压
	getBP: function(DeviceIdentity, id) {
		this.setData({
			bpLoading: true,
		})
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity,
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
			date: that.data.todayDate,
			page_no: 1,
			// page_num: 5,
			select_hour: 24
		};
		if (id != undefined && id != "0" && id) {
			data.id = id;
		}

		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getBP',
			data: data,
			success: function(ress) {
				that.setData({
					bpLoading: false,
				})
				if (ress.error == 0) {
					var data = ress.data;
					var list = []
					var systolicData = []
					var diastoliData = []
					var oxygenData = []
					var bpDataT = []
					var diastoli = 0;
					var systolic = 0;
					var today = that.data.todayDate.replace(/-/g,'/')
					if (ress.count > 0) {
						list = data.list;
						diastoli = list[0].diastoli; //舒张压
						systolic = list[0].systolic; //收缩压

						for (var k in list) {
							if ((k % 2 == 0 && list.length>=100) || list.length<100) {
								// systolicData.unshift(parseInt(list[k].systolic));
								// diastoliData.unshift(parseInt(list[k].diastoli));
								// bpDataT.unshift(list[k].time);
								// systolic = list[k].systolic;
								// diastoli = list[k].diastoli;

								let arr = []
								let arr2 = []
								let arr3 = []
								let time = new Date(today + ' ' + list[k].time).getTime()
								arr.push(time)
								arr.push(list[k].systolic)
								systolicData.unshift(arr);
								
								arr2.push(time)
								arr2.push(list[k].diastoli)
								diastoliData.unshift(arr2);
								
								arr3.push(time)
								arr3.push(list[k].oxygen)
								oxygenData.unshift(arr3);
							}
						}
					}
					that.setData({
						bp_time: data.time,
						systolic: systolic,
						diastoli: diastoli,
						systolicData:systolicData.length>0?[1,2]:[],
						diastoliData:diastoliData.length>0?[1,2]:[],
						oxygenData:oxygenData.length>0?[1,2]:[],
						oxygenAvg:data.avg.oxygen,
						diastoliAvg:data.avg.diastoli,
						systolicAvg:data.avg.systolic,
						bpDataT: bpDataT,
						isHideBP: true
					})
					// 血压
					if(!chartBP){
						setTimeout(()=>{
							that.ecBPComponent.init((canvas, width, height,dpr) => {
								chartBP = echarts.init(canvas, null, {
									width: width,
									height: height,
									devicePixelRatio: dpr
								});
								setOptions.setOptionBP2(chartBP,systolicData, diastoliData);
								return chartBP;
							});
						},1000)
						
					}else{
						setOptions.setOptionBP2(chartBP,systolicData,diastoliData);
					}
					
					// if(!chartOXY){
					// 	setTimeout(()=>{
					// 		that.ecOXYComponent.init((canvas, width, height,dpr) => {
					// 			chartOXY = echarts.init(canvas, null, {
					// 				width: width,
					// 				height: height,
					// 				 devicePixelRatio: dpr
					// 			});
					// 			setOptions.setOptionOxy(chartOXY,oxygenData);
					// 			return chartOXY;
					// 		});
					// 	},1000)
						
					// }else{
					// 	setOptions.setOptionOxy(chartOXY,oxygenData);
					// }
					
				}
			},
			fail(){
				that.setData({
					bpLoading: false
				})
			}
		})
	},
	
	//获取心率
	getHR: function(DeviceIdentity, id) {
		this.setData({
			bpmLoading: true,
		})
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity,
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
			date: that.data.todayDate,
			page_no: 1,
			// page_num: 5,
			select_hour: 24
		};
		if (id != undefined && id != "0" && id) {
			data.id = id;
		}

		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getHR',
			data: data,
			success: function(ress) {
				that.setData({
					bpmLoading: false
				})
				if (ress.error == 0) {
					var data = ress.data;
					var bpmData = []
					var bpmDataT = []
					var list = []
					var bpm = 0
					var today = that.data.todayDate.replace(/-/g,'/')
					if (ress.count > 0) {
						list = data.list;
						bpm = list[0].val;
						for (var k in list) {
							// bpmData.unshift(parseInt(list[k].val));
							// bpmDataT.unshift(list[k].time);
							// bpm = list[k].val;
							if ((k % 10 == 0 && list.length>=100) || list.length<100) {
								let arr = []
								arr.push(new Date(today + ' ' + list[k].time).getTime())
								arr.push(list[k].val)
								bpmData.unshift(arr);
							}
						}
					}
					
					that.setData({
						bpmData:bpmData.length>0?[1,2]:[],
						bpmAvg: ress.data.avg,
					})
					//加载统计图
					if(!chartBPM){
						setTimeout(()=>{
              // console.log(that.ecBPMComponent)
							that.ecBPMComponent.init((canvas, width, height,dpr) => {
								chartBPM = echarts.init(canvas, null, {
									width: width,
									height: height,
									devicePixelRatio: dpr
								});
								setOptions.setOptionBpm2(chartBPM, bpmData);
								return chartBPM;
							});
						},1000)
						
					}else{
						setOptions.setOptionBpm2(chartBPM, bpmData);
					}
					
				}
			},
			fail(){
				that.setData({
					bpmLoading: false
				})
			}
		})
  },
  changeDate(e){
    var  that =  this;
    console.log(e);
		let type = e.currentTarget.dataset.type || ""
		if(type){
			let num = type == 1 ? -1000*60*60*24:1000*60*60*24
			let getDay = new Date(new Date(this.data.todayDate).getTime()+num)
			if(getDay.getTime()>this.data.initDate){
				// app.alert_s('该日期暂无数据', this);
				return
			}
			this.setData({
				todayDate: util.formatOnlyDates(getDay),
				bpmData: [],
				hrvData: [],
				systolicData: [],
				diastoliData: [],
				oxygenData: [],
      })
			setTimeout(()=>{
    
        that.getHR(that.data.info.DeviceIdentity); //获取心率
        that.getBP(that.data.info.DeviceIdentity); //获取血压
        // that.getHRV(DeviceIdentity); //获取心率变异性
			},30)
		}
  },
  diastolicInput(e){
    this.setData({
      diastolic: e.detail.value,
    })
  },
  systolicInput(e){
    this.setData({
      systolic: e.detail.value,
    })
  },
  
  accInput(e){
    this.setData({
      acc: e.detail.value,
      check: (e.detail.value != '' && this.data.isPass == 0 || (this.data.isPass == 1 && this.data.pass != '')),
    })
  },
  passInput(e){
    this.setData({
      pass: e.detail.value,
      check: (this.data.acc != '' && this.data.isPass == 0 || (this.data.isPass == 1 && e.detail.value != '')),
    })
  },
  isPass(){
    if (this.data.isPass == 0) {
      this.setData({
        isPass: 1,
        check: (this.data.acc != '' && this.data.pass != ''),
      })
    } else {
      this.setData({
        isPass: 0,
        check: (this.data.acc != ''),
      })
    }
  
  },
  //添加WiFi
  confirmWiFi: function() {
    var that = this;
  
    var hex = '';
  
    var acc = that.data.acc;
    var pass = that.data.isPass == 1 ? that.data.pass : '';
  
    var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test(acc)) {
      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '账号名不能包含中文',
      })
      return;
    }
  
    var acc_hex = util.ascii2Hex(acc);
    var pass_hex = util.ascii2Hex(pass);
  
    var acc_hex_len = util.fillZero(Math.ceil((acc_hex.length / 2)).toString(16), 2);
    var pass_hex_len = util.fillZero(Math.ceil((pass_hex.length / 2)).toString(16), 2);
    // console.log(acc_hex_len,pass_hex_len)
  
    acc_hex = acc_hex_len + acc_hex;
    pass_hex = pass_hex_len + pass_hex;
  
    hex = acc_hex + pass_hex;
    console.log(hex)
  
  
    //获取蓝牙特征值
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.uuid,
      success: function (res) {
        console.log('device getBLEDeviceCharacteristics:', res.characteristics)
  
        that.setData({
          log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
        })
  
        // that.begin(that.data.deviceId);//蓝牙开始工作
  
        // that.setData({
        //     CharacteristicConnected: res.characteristics,
        // })
        that.notifyBLECharacteristicValueChange();//监听
        that.writeBLECharacteristicValue('E1', hex);//写入WiFi
  
        wx.showToast({
          icon: 'none',
          duration: 5000,
          title: ' 添加WiFi成功',
        })
  
        setTimeout(function () {
          that.setData({
            addWifiPage: 2,//测试用
          })
          // wx.redirectTo({
          //   url: '/pages/index/index'
          // })
        }, 5000);
      },
      fail: function (res) {
        // fail
        console.log('getBLEDeviceCharacteristics:fail');
        console.log(res);
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '获取characteristic失败',
        })
      },
    })
  },
  
  isShowWiFi:function(){
    if(this.data.addWifiPage==1){
      this.setData({
        addWifiPage:0,
      })
    }else{
      this.linkWifi();
    }
    
  },
  
  //更新当前时间
  updateTime: function() {
    var that = this;
  
    var hex = Date.parse(new Date()) + '';
    hex = parseInt(hex.substr(0, hex.length - 3));
    hex = hex.toString(16)
    console.log(hex)
  
  
    //获取蓝牙特征值
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.uuid,
      success: function (res) {
        console.log('device getBLEDeviceCharacteristics:', res.characteristics)
  
        that.setData({
          log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
        })
  
        // that.begin(that.data.deviceId);//蓝牙开始工作
  
        // that.setData({
        //     CharacteristicConnected: res.characteristics,
        // })
        that.notifyBLECharacteristicValueChange();//监听
        that.writeBLECharacteristicValue('A1', hex);//写入
  
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '更新当前时间成功',
        })
      },
      fail: function (res) {
        // fail
        console.log('getBLEDeviceCharacteristics:fail');
        console.log(res);
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '获取characteristic失败',
        })
      },
    })
  },
  
  
  
  //删除WiFi
  deleteWifi: function() {
    var that = this;
  
    var hex = '01';
    console.log(hex);
  
    //获取蓝牙特征值
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.uuid,
      success: function (res) {
        console.log('device getBLEDeviceCharacteristics:', res.characteristics)
  
        that.setData({
          log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
        })
  
        // that.begin(that.data.deviceId);//蓝牙开始工作
  
        // that.setData({
        //     CharacteristicConnected: res.characteristics,
        // })
        that.notifyBLECharacteristicValueChange();//监听
        that.writeBLECharacteristicValue('E2', hex);//写入
  
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '删除WiFi成功',
        })
      },
      fail: function (res) {
        // fail
        console.log('getBLEDeviceCharacteristics:fail');
        console.log(res);
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '获取characteristic失败',
        })
      },
    })
  },
  
  //删除全部WiFi
  deleteAllWifi: function() {
    var that = this;
  
    var hex = '';
  
    //获取蓝牙特征值
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.uuid,
      success: function (res) {
        console.log('device getBLEDeviceCharacteristics:', res.characteristics)
  
        that.setData({
          log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
        })
  
        // that.begin(that.data.deviceId);//蓝牙开始工作
  
        // that.setData({
        //     CharacteristicConnected: res.characteristics,
        // })
        that.notifyBLECharacteristicValueChange();//监听
        that.writeBLECharacteristicValue('E3', hex);//写入
  
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '删除全部WIFI成功',
        })
      },
      fail: function (res) {
        // fail
        console.log('getBLEDeviceCharacteristics:fail');
        console.log(res);
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '获取characteristic失败',
        })
      },
    })
  },
	// 分享接口
	onShareAppMessage: function(res) {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('index', 'index');
		if(that.data.treport && that.data.treport.db_id){
			data.share_true_url = data.share_true_url + '&id=' + that.data.treport.db_id;
		}
		if (res.target && res.target.id == "auth") {
			data.share_true_url = data.share_true_url + '&share_name=' + that.data.userInfo.Wechat_xcxSetUser.nickname +
				'&invite=1&inviteId=' + new Date().getTime()
		}
		console.log(data.share_true_url);
		//添加分享记录
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/addShareLog',
			data: data,
			success: function(res) {
				console.log('成功分享记录');
				console.log(res);
			}
		})
		return {
			// title: tokenInfo.shareAgencyPoster.share_title,
			// imageUrl: tokenInfo.shareAgencyPoster.share_image_url,
			path: data.share_true_url
		}
	}, //end 分享接口
});
