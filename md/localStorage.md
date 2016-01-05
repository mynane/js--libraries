##<center>localStorage的兼容性实现</center>
> locStorage 主要用于实现w3c localstorage的模拟<br/>
在ie中使用uerData实现。<br/>
主要方法有三个:<br/>
保存时间为**一年**。<br/>
* `setItem('key','value');`<br/>
* `getItem('key')`<br/>
* `removeItem('key'`)<br/>


```javascript
 var locStorage = function () {
    var UserData = {
        userData: null,
        name: location.hostname,
        //this.name = "css88.com";
        init: function () {
            if (!UserData.userData) {
                try {
                    UserData.userData = document.createElement('INPUT');
                    UserData.userData.type = "hidden";
                    UserData.userData.style.display = "none";
                    UserData.userData.addBehavior("#default#userData");
                    document.body.appendChild(UserData.userData);
                    var expires = new Date();
                    expires.setDate(expires.getDate() + 365);
                    UserData.userData.expires = expires.toUTCString();
                } catch (e) {
                    return false;
                }
            }
            return true;
        },
        setItem: function (key, value) {
            if (UserData.init()) {
                UserData.userData.load(UserData.name);
                UserData.userData.setAttribute(key, value);
                UserData.userData.save(UserData.name);
            }
        },
        getItem: function (key) {
            if (UserData.init()) {
                UserData.userData.load(UserData.name);
                return UserData.userData.getAttribute(key)
            }
        },
        removeItem: function (key) {
            if (UserData.init()) {
                UserData.userData.load(UserData.name);
                UserData.userData.removeAttribute(key);
                UserData.userData.save(UserData.name);
            }

        }
    };
    var _locStorage = null;
    if (typeof localStorage == "object") {
        _locStorage = localStorage;
    } else {
        _locStorage = UserData;
    }
    return {
        setItem: function (map, value) {
            if (typeof value != "undefined") {
                _locStorage.setItem(map, value);
            } else if (typeof map === "object") {
                for (var i in map) {
                    _locStorage.setItem(i, map[i]);
                }
            }
        },
        getItem: function (key) {
            return _locStorage.getItem(key);
        },
        removeItem: function (keys) {
            if (typeof keys == "string") {
                keys = [keys];
            }
            for (var i = 0, len = keys.length; i < len; i++) {
                _locStorage.removeItem(keys[i]);
            }
        }
    }
}();
```

