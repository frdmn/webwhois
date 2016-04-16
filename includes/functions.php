<?php
/**
 * Find integer index of a given key name (string)
 * in given object
 * @param  {Object} $object
 * @param  {String} $needle
 * @return {Integer/Boolean} false, if no result
 */
function getIntegerIndexOfObjectKey($object, $needle){
  $i = 0;
  foreach ($object as $objectkey => $obj) {
    if ($objectkey === $needle) {
      return $i;
    }
    $i++;
  }
  return false;
}

/**
 * Run whois lookup using phpwhois library
 * @param  {String} $domain The domain to lookup
 * @return {Object|false}   Whois results
 */
function runWhoisLookup($domain){
  global $config;

  // Split input domain by domain and TLD
  $domainParts = explode('.', $domain);
  $tld = $domainParts[1];

  // Create new phpwhois instance
  $whois = new Whois();

  // Check if custom whois server is set in config
  if ($config->{'whois-server'}->$tld) {
    $whois->useServer($tld, $config->{'whois-server'}->$tld);
  }

  // Store lookup results
  $result = $whois->lookup($domain);

  if ($result) {
    return $result;
  } else {
    return false;
  }
}

/**
 * Check register status for single domain
 * @param  {String} $domain The domain to lookup
 * @return {String|false}   Result of the lookup
 */
function checkIfRegistered($domain){
  $whoisResult = runWhoisLookup($domain);

  if ($whoisResult['regrinfo']['registered']) {
    return $whoisResult['regrinfo']['registered'];
  } else {
    return false;
  }
}

function isTldAllowed($config, $tld){
  if (in_array($tld, $config->tlds)){
    return true;
  } else {
    return false;
  }
}
