sudo apt update
sudo apt install wget default-jdk 

wget https://downloads.apache.org/kafka/3.5.1/kafka_2.13-3.5.1.tgz

tar xzf kafka_2.13-3.5.1.tgz

sudo mv kafka_2.13-3.5.1 /usr/local/kafka 

sudo nano /etc/systemd/system/zookeeper.service

# Paste the following content
[Unit]
Description=Apache Zookeeper server
Documentation=http://zookeeper.apache.org
Requires=network.target remote-fs.target
After=network.target remote-fs.target

[Service]
Type=simple
ExecStart=/usr/local/kafka/bin/zookeeper-server-start.sh /usr/local/kafka/config/zookeeper.properties
ExecStop=/usr/local/kafka/bin/zookeeper-server-stop.sh
Restart=on-abnormal

[Install]
WantedBy=multi-user.target

sudo nano /etc/systemd/system/kafka.service

# Paste the following content
[Unit]
Description=Apache Kafka Server
Documentation=http://kafka.apache.org/documentation.html
Requires=zookeeper.service

[Service]
Type=simple
Environment="JAVA_HOME=/usr/lib/jvm/java-1.11.0-openjdk-amd64"
ExecStart=/usr/local/kafka/bin/kafka-server-start.sh /usr/local/kafka/config/server.properties
ExecStop=/usr/local/kafka/bin/kafka-server-stop.sh

[Install]
WantedBy=multi-user.target

sudo systemctl daemon-reload

sudo systemctl start zookeeper

sudo systemctl start kafka

sudo systemctl enable zookeeper

sudo systemctl enable kafka

sudo systemctl status kafka