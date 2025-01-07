import { Calendar } from "fullcalendar";
import $ from "jquery";

export const ui = {
  // 탭 제목 설정
  // tapTitle() {
  // 	const now = new Date();
  // 	$("head title").text(`${now.getFullYear()}년 삼성전자 DS부문 리더십과정`);
  // },
  // 캘린더 시작
  calendarInit(ce, viewMonth, datesSet) {
    // const calendarEl = document.getElementById("calendar");
    // const calendar = new Calendar(calendarEl, {
    //     initialView: "dayGridMonth",
    // });
    // calendar.render();
    const now = new Date();
    const handleEventMouseEnter = (info) => {
      $(info.el)
        .parent()
        .css({
          width: "max-content",
          minWidth: `${$(info.el).width() + 5}px`,
          zIndex: 800,
          border: "3px solid black"
        });
      $(info.el)
        .css("margin", "0")
        .find(".fc-event-title")
        .css("font-size", "20px");
      $(".fc .fc-scroller-harness").css("overflow", "visible");
    };
    const handleEventMouseLeave = (info) => {
      $(info.el).parent().css({
        width: "auto",
        zIndex: 100,
        border: "none"
      });
      $(info.el)
        .css("margin", "1px 2px 0 2px")
        .find(".fc-event-title")
        .css("font-size", "16px");
      $(".fc .fc-scroller-harness").css("overflow", "hidden");
    };
    let calendarElm = document.getElementById("calendar");
    let calendar = new Calendar(calendarElm, {
      locale: "kr",
      hiddenDays: [0, 6],
      headerToolbar: {
        left: null,
        center: "title",
        right: "prev,next today"
      },
      buttonText: {
        today: "오늘",
        month: "월",
        week: "주",
        day: "일"
      },
      initialView: "dayGridMonth",
      // initialDate: new Date(
      //   `2024-${viewMonth < 10 ? "0" + viewMonth : viewMonth}-01`
      // ),
      initialDate: new Date(`2024-11-01`),
      editable: false,
      droppable: true,
      themeSystem: "bootstrap",
      views: {
        timeGrid: {
          // eventMaxStack: 1,
        }
      },
      eventClick(eventInfo) {
        let valueNum;
        const classList = $(eventInfo.el).attr("class").split(" ");
        for (let i = 0; i < classList.length; i++) {
          let match = classList[i].match(/apply-(\d+)/);
          if (match) {
            valueNum = match[1];
            break;
          }
        }
        ce(valueNum);
      },
      // validRange: {
      //   start: `${now.getFullYear()}-01-01`,
      //   end: `${now.getFullYear()}-12-31`
      // },
      // events: ,
      eventMouseEnter: handleEventMouseEnter,
      eventMouseLeave: handleEventMouseLeave,
      height: "auto",
      events: [{}],
      datesSet,
      eventDidMount(info) {
        let count = 0;
        let remainColor = "";
        let enrollStatus = false;
        const classList = $(info.el).attr("class").split(" ");
        for (let i = 0; i < classList.length; i++) {
          let match = classList[i].match(/remain-(\d+)/);
          let match2 = classList[i].match(/remainColor-(#[0-9A-Fa-f]{6})/);
          if (match) count = Number(match[1]) < 0 ? 0 : Number(match[1]);
          if (match2) {
            remainColor = `style='color:${match2[1]}'`;
          }
          if (classList[i] === "enroll") enrollStatus = true;
        }
        if (enrollStatus) {
          $(info.el).prepend(
            `<span class="limit_count"><i class="icon-check h3 d-block"></i></span>`
          );
        } else {
          $(info.el).prepend(
            `<span class="limit_count box" ${remainColor}>${count}</span>`
          );
        }
      }
      // events: [
      //     {
      //         title: "afasd",
      //         // start: year + "-" + "02-01",
      //         date: new Date("2024-01-18"),
      //         color: "rgb(0, 150, 136)",
      //         allDay: true,
      //         className: "apply-123",
      //     },
      //     {
      //         title: "Trip to London",
      //         start: year + "-" + month + "-01",
      //         end: year + "-" + month + "-02",
      //         color: "rgb(0, 150, 136)",
      //     },
      // ],
    });
    calendar.render();

    return calendar;
  },
  // type=file 초기화
  fileReset(id) {
    $(id).val("");
  },
  jexcelFocus(i, j) {
    setTimeout(() => {
      $(`.jexcel tbody tr:eq(${i}) td:eq(${j + 1})`).addClass(
        "highlight-selected highlight highlight-top highlight-bottom highlight-left highlight-right"
      );
      $(document).on("click", function () {
        $(`.jexcel tbody tr:eq(${i}) td:eq(${j + 1})`).removeClass(
          "highlight-selected highlight highlight-top highlight-bottom highlight-left highlight-right"
        );
        $(document).off("click");
      });
      $(".content .content_wrap").scrollTop(
        $(`.jexcel tbody tr:eq(${i}) td:eq(${j + 1})`).position().top -
          $(".content .content_wrap").height() / 2
      );
    }, 200);
  }
};

export const modalUI = {
  // 모달창 오픈
  open(target) {
    $(target).removeClass("delay").show().addClass("active");
  },
  // 모달창 닫기
  close(target) {
    if (!$(target).hasClass("active")) $(target).hide();
    else {
      $(target).removeClass("active").addClass("delay");
      setTimeout(() => {
        $(target).hide();
      }, 300);
    }
  }
};

export const groupLineUI = {
  groupLineDelete() {
    $(".group-line").hide();
  },
  groupLineSet() {
    $(".group-line").each(function (index) {
      const $groups = $(`.group-${index + 1}`);
      if ($groups.length < 2) $(this).hide();
      else {
        const rowTop = $("#application-table").offset().top;
        const group1 = $groups.eq(0);
        const group2 = $groups.eq(1);
        const group1top = group1.offset().top;
        const group2top = group2.offset().top;
        const group1Height = group1.height();

        const height = group2top - group1top;
        const top = group1top - rowTop + group1Height / 2;
        $(this).show().height(height).css("top", `${top}px`);
      }
    });
  }
};
