module.exports = {
  activeApi: "local",
  endpoints: {
    org: "http://www.smartmis.org/smartapi/Service.asmx?wsdl",
    local: "http://192.168.100.103/smartapi/service.asmx?wsdl",
    FFS: "http://182.191.68.109/FFSWebService/Service.asmx?wsdl",
    SMC: "http://182.191.68.109/SMCWebService/Service.asmx?wsdl"
  },
  port: 8081,
  serverIp: process.env.REACT_APP_API_IP
  
};