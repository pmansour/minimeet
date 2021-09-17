FROM balenalib/raspberry-pi-debian:latest
RUN sudo apt-get update
RUN sudo apt-get install -y chromium-browser
RUN sudo apt-get install -y lsb-release bluealsa pulseaudio
RUN sudo apt-get install -y libgles2-mesa libgles2-mesa-dev xorg-dev libegl1-mesa mesa-utils mesa-utils-extra

COPY src2/ /tmp/minimeet

CMD ["/usr/bin/chromium-browser", "--no-sandbox", "--enable-gpu-rasterization", "--enable-oop-rasterization", "--enable-accelerated-video-decode", "--ignore-gpu-blocklist", "--load-extension=/tmp/minimeet", "https://accounts.google.com/signin/v2?continue=https%3A%2F%2Fmeet.google.com"]
