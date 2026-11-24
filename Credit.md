# Credits

## Project

**MusoPhone** — an Android YouTube Music client.

- Official website: <https://musophone.vercel.app>
- Official repository: <https://github.com/Alshahriar-07/Musophone>

## Project Owner

**Al Shahriar Sowan**

## Development Credits

- **Al Shahriar Sowan** — Project ownership, direction, branding, integration, and development coordination.
- **ChatGPT (OpenAI)** — AI-assisted development, planning, and technical assistance.
- **DeepSeek** — AI-assisted development and technical assistance.

## Original Project Attribution

MusoPhone is a modified derivative of the open-source **BitChord** project:

- Repository: <https://github.com/kushagrasinghx/BitChord>
- Project creator and maintainer: **Kushagra Singh** ([@kushagrasinghx](https://github.com/kushagrasinghx))
- Upstream revision this build is based on: `21356206` (`1.10`, version code 42)

BitChord is the work of Kushagra Singh and the BitChord contributors. Their
names, copyright notices, licence terms and source history are retained in this
repository. MusoPhone does not claim authorship of the original BitChord source
code. The complete upstream contributor list is available in
[`MAINTAINERS.md`](MAINTAINERS.md) and in the repository's Git history.

## License

BitChord is distributed under the **GNU General Public License, version 3
(GPL-3.0)**, and MusoPhone is distributed under the same licence. The original
[`LICENSE`](LICENSE) file is preserved unchanged and the original copyright
notices remain in place.

MusoPhone is free software: you can redistribute it and/or modify it under the
terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version. MusoPhone is distributed in the hope that it will be useful, but
**WITHOUT ANY WARRANTY**; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See [`LICENSE`](LICENSE)
for the full text, and §5 of that licence for the requirements that apply to
modified versions.

The corresponding source code for MusoPhone is this repository. Anyone
distributing a MusoPhone binary must also make this source available under the
GPL-3.0.

## Modifications

MusoPhone introduces its own application branding, Android application identity
and selected project configuration changes, while retaining the original
BitChord application functionality, interface, architecture and integrations.
The complete, itemised list of changes is in
[`MODIFICATIONS.md`](MODIFICATIONS.md).

In summary:

- Application name and launcher/notification artwork are MusoPhone's.
- The Android `applicationId` is `com.musophone.player`
  (`com.dev.musophone.player` for dev builds), while the Kotlin namespace
  remains `com.music.bitchord`.
- Project-owned links (documentation, releases, website) point at MusoPhone.
- External service endpoints, upstream infrastructure and third-party
  integrations were left unchanged so the application keeps working.

MusoPhone is not affiliated with, endorsed by, or connected to BitChord,
Google LLC or YouTube.
