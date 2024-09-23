import $ from "jquery";
import "jquery.easing";

export const uiScr = {
	// 스크롤 맨 위로 0.5동안
	goTop() {
		$("html").animate(
			{
				scrollTop: 0,
			},
			500
		);
	},
	// 스크롤 바로 탑
	goTopRight(scrollTop) {
		$("html").animate(
			{
				scrollTop,
			},
			0
		);
	},
	// 스크롤최하단 이동
	goBottom() {
		$("html").animate(
			{
				scrollTop: $(document).height(),
			},
			0
		);
	},
	// 스크롤탑 버튼 나타나기
	scrollTopBtn() {
		let wHeight = $(window).height();
		let dHeight = $(document).height();
		let sTop = $(window).scrollTop();
		if (wHeight / 2 < sTop) {
			$("#topButton").fadeIn();
		} else {
			$("#topButton").fadeOut();
		}
		$(window).on("scroll", function () {
			wHeight = $(window).height();
			dHeight = $(document).height();
			sTop = $(this).scrollTop();
			if (wHeight / 2 < sTop) {
				$("#topButton").fadeIn();
			} else {
				$("#topButton").fadeOut();
			}
		});
	},
	/*  */
	// 전체과정프로그램 스크롤
	programIntroScroll(categoryLeng) {
		let topList = [];
		for (let i = 1; i <= categoryLeng; i++) {
			topList.push($(`#content${i}`).offset().top - 100);
		}
		let initQuickTop = $("#content").offset().top - 90;
		let sTop = $(this).scrollTop();
		/* 사이드바 위치표시 */
		$(".sidebar-list li a.active").removeClass("active");
		if (0 <= sTop && sTop < topList[1]) {
			$(`.sidebar-list li a:eq(0)`).addClass("active");
		}
		topList.map((v, i) => {
			if (0 < i && i < topList.length - 1) {
				if (topList[i] <= sTop && sTop < topList[i + 1]) {
					$(`.sidebar-list li a:eq(${i})`).addClass("active");
				}
			}
		});
		if (topList[topList.length - 1] < sTop) {
			$(`.sidebar-list li a:eq(${topList.length - 1})`).addClass("active");
		}
		/* 사이드바 fixed */
		if (sTop > initQuickTop) {
			$("#quick .section-container").css("position", "fixed");
		} else {
			$("#quick .section-container").css("position", "absolute");
		}
	},
	// 전체과정프로그램 바로가기
	programQuickScroll(idNum) {
		$("html").animate(
			{
				scrollTop: $(`#content${idNum}`).offset().top - 95,
			},
			500
		);
	},
	/*  */
	// 관리자 프로그램관리
	programAdminHeaderFixed() {
		if ($("#headerFixed").length) {
			const headerTop = $("#headerFixed").offset().top;
			const sTop = $(this).scrollTop();
			if (sTop < headerTop) {
				$("header.program_header").hide();
			} else {
				$("header.program_header").show();
			}
		}
	},
	/*  */
	// 수강신청 스크롤
	listViewHeaderFixed() {
		if ($("#application-table").length) {
			const headerTop = $("#application-table").offset().top;
			const sTop = $(this).scrollTop();
			if (sTop < headerTop) {
				$("#list_header").hide();
			} else {
				$("#list_header").show();
			}
		}
	},
	/*  */
	// 메인공지사항 자동슬라이드
	curNum: 1,
	/* 
	mainNoticeSlice(noticeLeng) {
		$("#notice ul").css("top", `${-70 * (this.curNum + noticeLeng - 1)}px`);
		let that = this;
		let result = setInterval(() => {
			$("#notice ul").animate(
				{
					top: $("#notice ul").position().top - 70,
				},
				1500,
				"easeInCubic",
				function () {
					that.curNum++;
					if (that.curNum > noticeLeng) {
						$("#notice ul").css("top", `${-70 * noticeLeng}px`);
						that.curNum = 1;
					}
				}
			);
		}, 3500);
		return result;
	},
	 */
	mainNoticeSlice_act(noticeLeng) {
		$("#notice ul").css("top", `${-70 * (this.curNum + noticeLeng - 1)}px`);
	},
	mainNoticeSlice_Interval(noticeLeng) {
		if ($("#notice ul").length > 0) {
			// let that = this;
			$("#notice ul").animate(
				{
					top: $("#notice ul").position().top - 70,
				},
				1500,
				"easeInCubic",
				function () {
					uiScr.curNum++;
					if (uiScr.curNum > noticeLeng) {
						$("#notice ul").css("top", `${-70 * noticeLeng}px`);
						uiScr.curNum = 1;
					}
				}
			);
		}
	},
	mainNoticeSliceUp(noticeLeng) {
		if (this.curNum <= -1 * noticeLeng + 1) return;
		--this.curNum;
		let that = this;
		$("#notice ul")
			.stop()
			.animate(
				{
					top: -70 * (this.curNum + noticeLeng - 1),
				},
				400,
				function () {
					if (that.curNum <= 0) {
						that.curNum = noticeLeng + that.curNum;
						$("#notice ul").css("top", `${-70 * (that.curNum + noticeLeng - 1)}px`);
					}
				}
			);
	},
	mainNoticeSliceDown(noticeLeng) {
		if (this.curNum > noticeLeng * 2 - 1) return;
		this.curNum++;
		let that = this;
		$("#notice ul")
			.stop()
			.animate(
				{
					top: -70 * (this.curNum + noticeLeng - 1),
				},
				400,
				function () {
					if (that.curNum >= noticeLeng + 1) {
						that.curNum = that.curNum - noticeLeng;
						$("#notice ul").css("top", `${-70 * (that.curNum + noticeLeng - 1)}px`);
					}
				}
			);
	},
};
