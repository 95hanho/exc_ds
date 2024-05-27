/*
Template Name: Color Admin - Responsive Admin Dashboard Template build with Twitter Bootstrap 5
Version: 5.3.1
Author: Sean Ngu
Website: http://www.seantheme.com/color-admin/
*/


/* Controller
------------------------------------------------ */
$(document).ready(function() {
	const sections = document.querySelectorAll('#bsSpyContent > div');
	const navLinks = document.querySelectorAll('#bsSpyTarget > a');
	const lastElHeight = sections[sections.length - 1].getBoundingClientRect().height;

	window.onscroll = (el) => {
		sections.forEach((section) => {
			let top = window.scrollY;
			let offset = section.offsetTop - 150;
			let height = section.offsetHeight;
			let id = section.getAttribute('id');

			if (top >= offset && top < offset + height) {
				navLinks.forEach((links) => {
					links.classList.remove('active');
					document.querySelector(`nav a[href*='${id}']`).classList.add('active');
				});
			}

			if (
				sections[sections.length - 1].getBoundingClientRect().top < lastElHeight
			) {
				navLinks.forEach((links) => {
					links.classList.remove('active');
					document.querySelector(`nav a[href*='${id}']`).classList.add('active');
				});
			}
		});
	};
});