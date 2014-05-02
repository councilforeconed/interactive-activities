#!/bin/bash -e

NODE_USER=${NODE_USER:-node}
NODE_HOME=/home/$NODE_USER
ENV_FILE=$NODE_HOME/node_env.sh

PROJECT_DIR=${PROJECT_DIR:-$NODE_HOME/cee}
GIT_URL=${GIT_URL:-git@github.com:councilforeconed/cee.git}

# Install package dependencies
apt-get install git authbind
npm install -g grunt-cli bower forever

# Create a user for the Node.js process
adduser node
if [[ -v KEY_DIR ]]; then
    cp --recursive $KEY_DIR $NODE_HOME/.ssh
fi

# Expose environmental variables to deploy script
cat <<EOT > $ENV_FILE
PROJECT_DIR=$PROJECT_DIR
GIT_URL=$GIT_URL
EOT
# Expose environmental variables to interactive shell sessions
echo "source $ENV_FILE" >> $NODE_HOME/.bashrc

mkdir -p $PROJECT_DIR
chown $NODE_USER:$NODE_USER $PROJECT_DIR
chown $NODE_USER:$NODE_USER $NODE_HOME -R

# Allow the Node user to bind to port 80
touch /etc/authbind/byport/80
chown $NODE_USER:$NODE_USER /etc/authbind/byport/80
chmod 755 /etc/authbind/byport/80

# Schedule the scripts to run on system reboot
cd $PROJECT_DIR
sudo -u $NODE_USER git clone $GIT_URL .
cat <<EOF > crontab-file
@reboot $PROJECT_DIR/deployment/deploy.sh
@reboot forever start $PROJECT_DIR/deployment/webhook-server.js
EOF
sudo -u $NODE_USER crontab crontab-file
rm crontab-file

reboot
