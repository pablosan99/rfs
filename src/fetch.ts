import { useEffect, useState } from 'react';
import { Data, emptyData } from './model';

const useFetch = () => {
  const [data, setData] = useState<Data>(emptyData);

  useEffect(() => {
    fetch('/data.json').then((response) => {
      response.json().then((_data: Data) => {

        for (let i = 0; i < _data.occupancy.length; i++) {
          const current = _data.occupancy[i];
          current.frequency *= 1000;
          current.value = Math.round(current.value);
          if (_data.occupancy.length > i + 1) {
            const next = _data.occupancy[i+1];
            current.next = {
              ...next,
              frequency: next.frequency * 1000
            };
          }
        }
        setData(_data);
      })
    })
  }, [])

  return [data]
}

export default useFetch;