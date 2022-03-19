for ext_host in "external-api.dev"
do
  HOST_IP=`/sbin/ip route|awk '/default/ { print $3 }'`
  echo "${HOST_IP} ${ext_host}" | tee -a /etc/hosts

  if [ ! -d "node_modules/" ]; then
    exec sh -c "npm install"
  fi

  exec sh -c "npm run dev"
done