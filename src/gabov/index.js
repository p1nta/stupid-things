function main() {
  const isTouchDevice = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0);


  let dialogValue;
  let variant = 1;
  let letActiveAudioEl;

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

  function dialogInit() {
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
          if (letActiveAudioEl) {
            letActiveAudioEl.pause();
            letActiveAudioEl = null;
          }

          dialog.showModal();
        });

        confirmBtn.addEventListener("click", function (event) {
          variant = Number(dialogValue);
          event.preventDefault();
          dialog.close();
        });
      }
    }
  }

  function listenersInit() {
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i];
      addListener(element);
    }
  }

  function addListener(element) {
    function listenerEnter() {
      if (letActiveAudioEl) {
        letActiveAudioEl.pause();
        letActiveAudioEl = null;
      }

      letActiveAudioEl = element?.getElementsByTagName('audio')[variant];
      letActiveAudioEl?.play();
    };

    if (isTouchDevice) {
      element.addEventListener('touchstart', listenerEnter);
    } else {
      element.addEventListener('mouseenter', listenerEnter);
    }
  }


  dialogInit();
  listenersInit();
}

window.onload = main;
