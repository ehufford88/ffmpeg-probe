'use strict'

const path = require('path');
const execa = require('execa');

module.exports = async (input, opts = []) => {
  var ffprobeExec = 'ffprobe';
  if (typeof process.env.FFPROBE_PATH != 'undefined') {
    ffprobeExec = process.env.FFPROBE_PATH;
  }
  const { stdout } = await execa(ffprobeExec, [
    '-print_format', 'json',
    '-show_error',
    '-show_format',
    '-show_streams',
    ...opts,
    input
  ]);

  const probe = JSON.parse(stdout);

  if (probe.streams && probe.streams.length) {
    const stream = probe.streams
      .find((stream) => stream.codec_type === 'video') || probe.streams[0];

    probe.duration = Math.round(stream.duration * 1000);
    probe.width = stream.width;
    probe.height = stream.height;

    const fpsFraction = stream.avg_frame_rate.split('/');
    probe.fps = fpsFraction[0] / fpsFraction[1];
  } else {
    probe.duration = undefined;
    probe.width = undefined;
    probe.height = undefined;
  }

  return probe;
}
