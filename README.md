# bleberry
Raspberry Pi Bluetooth Configuration Interface

In order to run without sudo, run the following command (must have `libcap2-bin`) installed.

    sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

