# See https://github.com/ledermann/docker-rails/blob/develop/Dockerfile
FROM ruby:2.6.5-alpine

RUN apk add --update --no-cache \
    build-base \
    postgresql-dev \
    imagemagick \
    nodejs \
    yarn \
    tzdata \
    libnotify \
    git \
    vim

COPY Gemfile* /usr/src/app/
COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
WORKDIR /usr/src/app

ENV BUNDLE_PATH /gems

RUN bundle install
RUN yarn install --check-files

# New versions of vim enter visual mode when you use the mouse to highlight things (e.g. to copy / paste). Disable that.
RUN echo "set mouse-=a" >> ~/.vimrc

COPY . /usr/src/app/

CMD ["/bin/sh"]
