// 全局变量
var timelist, nowtime, nowitems, nowpage, rankid;
var category = "NORMAL";


// 定时任务，检测服务器状态
function statusTask() {
    $.get("/api/status", function(data) {
        // console.log("/api/status");
        // console.log(data);
        if (data.hasOwnProperty("errno") && data.errno === 0) {
            if (data.data) {
                // 服务器正在下载图片
                $(".download-status").css("background-color", "#59f");
            } else {
                // 服务器正常
                $(".download-status").css("background-color", "#5f9");
            }
        } else {
            // console.log("连接服务器失败");
            $(".download-status").css("background-color", "red");
            $(".logout-icon,.deleteicon,.delete").hide();
        }
    })
}
var intervalTask = setInterval("statusTask()", 60000);


function showMsg(text) {
    // 显示提示信息（可重复）
    var $timestamp = String(new Date().getTime());
    $("body").append("<div class=\"return-message " + $timestamp + "\">" + text + "</div>");
    $(".return-message." + $timestamp).animate({
        right: "10px"
    }, 300, function() {
        setTimeout(function() {
            $(".return-message." + $timestamp).animate({
                right: "-300px"
            }, 300, function() {
                $(".return-message." + $timestamp).remove();
            });
        }, 3000)
    });
}

function thumReload() {
    // 获取元素信息
    $.cookie("category", category);
    // console.log("thumReload:" + category);
    $(".img-thum-wapper").empty();
    obj = {
        "category": category,
        "time": nowtime
    }
    $.ajax({
        url: "/api/items",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify(obj),
        success: function(data) {
            if (data.hasOwnProperty("errno") && data.errno === 0) {
                if (!data.data.hasOwnProperty(nowtime)) {
                    // console.log("返回列表为空")
                } else {
                    // console.log(data);
                    nowitems = data.data[nowtime];
                    if ($(".logout-icon").is(':hidden')) {
                        for (var i = 0; i < nowitems.length; i++) {
                            $(".img-thum-wapper").append('<div class="item"><a href="javascript:;" class="thumimg" name="' + String(i) + '"><img src="/static/img/thum/' + nowitems[i].illust + '.png" alt="' + nowitems[i].illust + '-thum"></a><div class="count">' + nowitems[i].count + '</div></div>');
                        }
                    } else {
                        for (var i = 0; i < nowitems.length; i++) {
                            $(".img-thum-wapper").append('<div class="item"><a href="javascript:;" class="thumimg" name="' + String(i) + '"><img src="/static/img/thum/' + nowitems[i].illust + '.png" alt="' + nowitems[i].illust + '-thum"></a><a class="deleteicon" href="javascript:;"><i class="iconfont">&#xe624;</i></a><div class="count">' + nowitems[i].count + '</div></div>');
                        }
                    }

                }
            } else {
                // 连接服务器失败
                // console.log("连接服务器失败");
                $(".download-status").css("background-color", "red");
                $(".logout-icon,.deleteicon,.delete").hide();
            }
        }
    });
}

// main
$(document).ready(function() {
    // console.log("Web client running.");
    // 本地状态检测
    var temp = $.cookie("category");
    if (!(typeof(temp) === "undefined") && (temp === "NORMAL" || temp === "R18" || temp === "ALL")) {
        category = temp;
        // console.log("main:" + category);
        switch (temp) {
            case "NORMAL":
                $(".category-status").css("background-color", "#5f9");
                break;
            case "R18":
                $(".category-status").css("background-color", "#ff5");
                break;
            case "ALL":
                $(".category-status").css("background-color", "#59f");
                break;
        }
    }
    temp = $.cookie("categorybtn");
    if (!(typeof(temp) === "undefined") && temp === "true") {
        $(".category-status").show();
    }
    // 服务器状态检测
    statusTask();
    // 身份验证
    $.get("/api/verification", function(data) {
        if (data.hasOwnProperty("errno")) {
            if (data.errno === 0) {
                // 登录成功
                // console.log("登录成功");
                $(".logout-icon,.deleteicon,.delete").show();
                $(".category-status").show();
            } else {
                // 登录失败
                // console.log("登录失败");
                $(".logout-icon,.deleteicon,.delete").hide();
            }
        } else {
            // 连接服务器失败
            // console.log("连接服务器失败");
            $(".download-status").css("background-color", "red");
            $(".logout-icon,.delete").hide();
        }
    });
    // 获取后台信息
    $.get("/api/time", function(data) {
        // 时间列表
        if (data.hasOwnProperty("errno") && data.errno == 0) {
            timelist = data.data;
            nowtime = timelist[0];
            // console.log("获取时间列表");
            for (var i = 0; i < timelist.length; i++) {
                // console.log(timelist[i]);
                $(".time-menu").append('<li><a href="javascript:;">' + String(timelist[i]) +
                    '</a></li>');
            }
            $(".time-menu a:contains(" + String(nowtime) + ")").addClass("now-time");
            // 加载缩略图
            thumReload();
        } else {
            // 连接服务器失败
            // console.log("连接服务器失败");
            $(".download-status").css("background-color", "red");
            $(".logout-icon,.delete").hide();
        }
    });
});

//退出登录
$(".logout-icon").click(function() {
    if (confirm("是否要注销？")) {
        $.get("/api/logout");
        $.cookie("AuthCert", null);
        $(".logout-icon,.deleteicon,.delete").hide();
        var temp = $.cookie("categorybtn");
        if (!(typeof(temp) === "undefined") && temp === "true") {
            $(".category-status").show();
        } else {
            $(".category-status").hide();
        }
    }
})


// 绑定菜单
function showMenu() {
    if ($(".ext-menu").height() === 0) {
        $(".ext-menu").height("90vh");
        $(".place div").css("display", "block");
    } else {
        $(".ext-menu").height(0);
        $(".place div").css("display", "none");
    }
}
$(".menu-icon,.place").click(function() {
    showMenu();
});

// 双击标题返回最上面
$("h1").dblclick(function() {
    $('html , body').animate({
        scrollTop: 0
    }, 300);
})

// 类型切换按键显示
var timeout;
$(".download-status").mousedown(function() {
    timeout = setTimeout(function() {
        if ($(".category-status").is(':hidden')) {
            $(".category-status").show();
            $.cookie("categorybtn", "true");
        } else if ($(".logout-icon").is(':hidden')) {
            $(".category-status").hide();
            $.cookie("categorybtn", "false");
        }
    }, 3000);
});
$(".download-status").mouseup(function() {
    clearTimeout(timeout);
});


// 类型切换
$(".category-status").dblclick(function() {
    switch (category) {
        case "NORMAL":
            category = "R18";
            $(".category-status").css("background-color", "#ff5");
            break;
        case "R18":
            category = "ALL";
            $(".category-status").css("background-color", "#59f");
            break;
        case "ALL":
            category = "NORMAL";
            $(".category-status").css("background-color", "#5f9");
            break;
    }
    // 重新载入缩略图
    thumReload();
})


// 换日期
$(".time-menu").on("click", "a", function() {
    snowtime = $(this).text();
    // console.log(snowtime);
    $(".time-menu a:contains(" + String(nowtime) + ")").removeClass("now-time");
    $(".time-menu a:contains(" + snowtime + ")").addClass("now-time");
    nowtime = Number(snowtime);
    // 重新载入缩略图
    thumReload();
});


function origView(pageid) {
    if (!(pageid >= 0 && pageid < nowitems[rankid].count)) {
        return;
    }
    var snowtime = String(nowtime);
    var yea = snowtime.substring(0, 4); // 年文件夹
    var mon = snowtime.substring(4, 6); // 月文件夹
    var day = snowtime.substring(6, 8); // 日文件夹
    var orgUrl = "/static/img/orig/" + yea + "/" + mon + "/" + day + "/" + String(nowitems[rankid].illust) + "-" + String(pageid) + "." + nowitems[rankid].suffix;
    nowpage = pageid; // 第n张照片
    $(".img-orig-wapper img").attr("src", orgUrl);
    $(".img-orig-wapper img").attr("alt", String(nowitems[rankid].illust) + "-orig");
    $("h2").text(nowitems[rankid].title + " - " + String(nowitems[rankid].illust));
    var tagsText = "";
    for (var i = 0; i < nowitems[rankid].tags.length; i++) {
        tagsText += ", " + nowitems[rankid].tags[i];
    }
    $("footer>span").text(tagsText.substring(2));
    if (pageid === 0) {
        $(".first-page").addClass("disable");
        $(".last-page").addClass("disable");
    } else {
        $(".first-page").removeClass("disable");
        $(".last-page").removeClass("disable");
    }
    if (pageid === nowitems[rankid].count - 1) {
        $(".next-page").addClass("disable");
    } else {
        $(".next-page").removeClass("disable");
    }
    $(".orig-link").attr("href", orgUrl);
    $(".img-thum-wapper").hide();
    $(".img-orig-wapper").show();
    $(".time-menu").hide();
    $(".function-menu").show();
    $("h1").hide();
    $("h2").show();
    $("footer>a").hide();
    $("footer>span").show();
}


// 原图视窗
$(".img-thum-wapper").on("click", ".item>.thumimg", function() {
    rankid = Number($(this).attr("name")); // 找到第几张图片
    origView(0) // 展示第一张照片
});

// 点击原图展开菜单
$(".img-orig-wapper").on("click", "a", function() {
    showMenu();
});

$(".homepage").click(function() {
    showMenu(); // 关闭菜单
    $(".img-orig-wapper").hide();
    $(".img-thum-wapper").show();
    $(".function-menu").hide();
    $(".time-menu").show();
    $("h2").hide();
    $("h1").show();
    $("footer>span").hide();
    $("footer>a").show();
});

$(".first-page").click(function() {
    showMenu();
    origView(0);
});

$(".last-page").click(function() {
    showMenu();
    origView(nowpage - 1);
});

$(".next-page").click(function() {
    showMenu();
    origView(nowpage + 1);
});

function deleteItem(rankid) {
    if (confirm("是否确认删除？")) {
        var illust = nowitems[rankid].illust;
        var obj = {
            "type": 0,
            "illust": illust
        }
        $.ajax({
            url: "/api/delete",
            type: "post",
            contentType: "application/json",
            data: JSON.stringify(obj),
            success: function(data) {

                if (data.hasOwnProperty("errno")) {
                    showMsg("Delete " + String(illust) + " - " + data.msg);
                    if (data.errno === 0) {
                        $(".img-thum-wapper .item:nth-child(" + String(rankid) + ")").hide();
                    } else if (data.errno === 6) {
                        alert("未登录或登录过期");
                        $(".logout-icon").click();
                    }
                } else {
                    alert("服务器连接错误！");
                    $(".download-status").css("background-color", "red");
                    $(".logout-icon,.deleteicon,.delete").hide();
                }
            }
        });

    }
}

function deleteApi(obj) {
    $.ajax({
        url: "/api/delete",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify(obj),
        success: function(data) {
            if (data.hasOwnProperty("errno") && data.errno === 6) {
                alert("未登录或登录过期");
                $(".logout-icon").click();
            }
            console.log(data);
        }
    });
}

function deleteCategoryItem(category) {
    if (confirm("是否确认删除？")) {
        var obj = {
            "type": 1,
            "category": category.toUpperCase()
        }
        deleteApi(obj);
    }
}

function deleteTypelistItem(typelist) {
    if (confirm("是否确认删除？")) {
        var obj = {
            "type": 1,
            "typelist": typelist
        }
        deleteApi(obj);
    }
}

function deleteAllItem(typelist) {
    if (confirm("是否确认删除？")) {
        var obj = {
            "type": 2
        }
        deleteApi(obj);
    }
}


$(".delete").click(function() {
    deleteitem(rankid);
    $(".homepage").click();
});


$(".img-thum-wapper").on("click", ".deleteicon", function() {
    var rankid = Number($(this).siblings(".thumimg").attr("name"));
    deleteItem(rankid);
});