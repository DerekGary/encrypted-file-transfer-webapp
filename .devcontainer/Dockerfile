FROM mcr.microsoft.com/devcontainers/python:1-3.11-bullseye

ENV PYTHONUNBUFFERED=1
ENV NODE_MAJOR=20
ENV DEBIAN_FRONTEND=noninteractive

# Set the environment variable for Watchpack polling
# This allows for the React frontend to hot reload our changes.
ENV WATCHPACK_POLLING=true

# Define arguments for user creation
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Set up git (adjust commands as necessary for your setup)
RUN git config --global user.name "DerekGary" && \
    git config --global user.email "jgary@uccs.edu"


# Install sudo and create a non-root user with sudo access
RUN apt-get update && apt-get install -y sudo \
    && groupadd --gid $USER_GID $USERNAME || echo "Group $USER_GID already exists" \
    && useradd -s /bin/bash --uid $USER_UID --gid $USER_GID -m $USERNAME || echo "User $USERNAME already exists" \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set up git (adjust commands as necessary for your setup)
RUN git config --global user.name "Your Name" && \
    git config --global user.email "your.email@example.com"

# Install additional packages and Node.js
RUN apt-get update \
    && apt-get -y install --no-install-recommends apt-utils dialog git iproute2 procps lsb-release ca-certificates curl gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y nodejs

# If you decide to use requirements.txt, uncomment the following lines and add your requirements.txt file to the context
# COPY requirements.txt /tmp/pip-tmp/
# RUN pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt && rm -rf /tmp/pip-tmp

# Clean up
RUN apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=dialog

# Set the default user
USER $USERNAME
