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
 * @param  {String} $domain
 * @return {Object} whois results
 */
function runWhoisLookup($domain){
  $whois = new Whois();
  // $whois->useServer('academy','whois.autodns3.de');

  $result = $whois->lookup($domain);

  if ($result) {
    return $result;
  } else {
    return false;
  }
}

function checkIfRegistered($domain){
  $whoisResult = runWhoisLookup($domain);

  if ($whoisResult['regrinfo']['registered']) {
    return $whoisResult['regrinfo']['registered'];
  } else {
    return false;
  }
}
