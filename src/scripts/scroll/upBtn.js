export const setupScroll = () => {
    const scrollBtn = document.getElementById('scrollBtn');
    const scrollWindow = function () {  
        if (window.scrollY != 0) {
          setTimeout(function () {
            window.scrollTo(0, window.scrollY - 50);
            scrollWindow();
          }, 10);
        }
      };
      scrollBtn.addEventListener("click", scrollWindow);
}