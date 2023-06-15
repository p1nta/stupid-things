function main() {
  const isTouchDevice = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0);


  let dialogValue;
  let variant = -1;

  const elements = [
    document.getElementById('block_italy'),
    document.getElementById('block_ukraine'),
    document.getElementById('block_finland'),
    document.getElementById('block_georgia'),
    document.getElementById('block_germany'),
    document.getElementById('block_netherlands'),
    document.getElementById('block_czech'),
    document.getElementById('block_france'),
    document.getElementById('block_poland'),
    document.getElementById('block_spain'),
    document.getElementById('block_japan'),
    document.getElementById('block_vietnam'),
    document.getElementById('block_brazil'),
    document.getElementById('block_armenia'),
    document.getElementById('block_israel'),
    document.getElementById('block_trex'),
  ];

  function dialogInit(callback) {
    const showButton = document.getElementById("showDialog");
    const dialog = document.getElementById("audioOptionsDialog");

    if (dialog && showButton) {
      const form = dialog.querySelector("form");
      const confirmBtn = dialog.querySelector("#confirmBtn");

      if (form && confirmBtn) {
        for (let i = 0; i < form.audio_version.length; i++) {
          form.audio_version[i].addEventListener('change', function () {
            dialogValue = this.value;
          });
        }

        showButton.addEventListener("click", function () {
          dialog.showModal();
        });

        confirmBtn.addEventListener("click", function (event) {
          variant = Number(dialogValue);
          event.preventDefault();
          dialog.close();
          callback();
        });
      }
    }
  }

  function listenersInit() {
    const listeners = [];

    return function () {
      if (listeners.length) {
        for (let i = 0; i < listeners.length; i += 1) {
          const element = listeners[i];
          element();
          listeners.splice(i, 1);
        }
      }



      for (let i = 0; i < elements.length; i += 1) {
        const element = elements[i];
        const audioEl = element?.getElementsByTagName('audio')[variant];

        if (audioEl) {
          const { add, remove } = addListener(audioEl)

          listeners.push(remove);

          add(element);
        }
      }
    }
  }

  function main() {

  }

  function addListener(audioEl) {
    function listenerEnter() {
      audioEl.play();
    };
    function listenerLeave() {
      audioEl.pause();
    };

    return {
      add: function (el) {
        if (isTouchDevice) {
          el.addEventListener('touchstart', listenerEnter);

          el.addEventListener('touchcancel', listenerLeave);
          el.addEventListener('touchleave', listenerLeave);
        } else {
          el.addEventListener('mouseenter', listenerEnter);

          el.addEventListener('mouseleave', listenerLeave);
        }
      },
      remove: function (el) {
        if (isTouchDevice) {
          el.removeEventListener('touchstart', listenerEnter);

          el.removeEventListener('touchcancel', listenerLeave);
          el.removeEventListener('touchleave', listenerLeave);
        } else {
          el.removeEventListener('mouseenter', listenerEnter);

          el.removeEventListener('mouseleave', listenerLeave);
        }
      },
    }
  }
  dialogInit(listenersInit());
}

window.onload = main;
