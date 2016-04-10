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
