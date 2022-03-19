for ext_host in "external-api.dev"
do
  HOST_IP=`/sbin/ip route|awk '/default/ { print $3 }'`
  echo "${HOST_IP} ${ext_host}" | tee -a /etc/hosts
  npm run dev
done
exec sh -c "tail -f /dev/null;"