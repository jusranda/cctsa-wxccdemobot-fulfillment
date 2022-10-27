#
# Copyright 2022 Justin Randall, Cisco Systems Inc. All Rights Reserved.
# 
# This program is free software: you can redistribute it and/or modify it under the terms of the GNU
# General Public License as published by the Free Software Foundation, either version 3 of the License, or 
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without 
# even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
# See the GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License along with this program. If not, 
# see <https://www.gnu.org/licenses/>.

# Set base image and working directory.
FROM node:18-slim
WORKDIR /usr/src/app

# Copy dependency manifests and code to the image.
COPY package*.json ./
COPY ./src/ ./

# Install node dependencies on image and start node.
RUN npm ci --only=production
CMD [ "node", "index.js" ]