# At this moment (atm)
Discover photos taken near you!

This app lets you find photos taken by others based on your location. 


![alt tag](https://raw.githubusercontent.com/clanofnoobs/atm/master/public/images/screen.png)
![alt tag](https://raw.githubusercontent.com/clanofnoobs/atm/master/public/images/screen2.png)

## Built with
<ul>
  <li>MongoDB</li>
  <li>Express.js</li>
  <li>Angular.js</li>
  <li>Node.js</li>
  <li>jQuery</li>
</ul>

## API usage
### Get all photos
`
GET /
`

### Get all photos based on coordinates


`
GET /?latitude=<lat>&longitude=<long>
`

### Get/Update photo by unique token


`
GET /get/:uniq_token/
`


`
GET /get/:uniq_token/upvote
`



